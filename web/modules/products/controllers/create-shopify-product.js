/* eslint-disable function-paren-newline */
/* eslint-disable object-curly-newline */
import shopify from '../../../shopify.js';
import { getClient, query } from '../../../database/connect.js';

const convertShopifyGraphQLIdToNumber = (id) => {
  if (!id) return null;
  if (typeof id === 'number') return id;
  return parseInt(id.split('/').pop(), 10);
};

const createShopifyProduct = async (req, res) => {
  try {
    const { session } = res.locals.shopify;

    const { title, handle, producerProductId, customVariants, productData } =
      req.body;

    const productExists = await query(
      `
    SELECT * FROM products WHERE producer_product_id = $1;
    `,
      [convertShopifyGraphQLIdToNumber(producerProductId)]
    );

    if (productExists.rows.length > 0) {
      throw new Error('Product already exists');
    }

    const tempHubProduct = new shopify.api.rest.Product({
      session
    });

    tempHubProduct.title = title;
    tempHubProduct.body_html = productData.body_html;
    tempHubProduct.images = productData.images;

    tempHubProduct.handle = handle;
    tempHubProduct.metafields = [
      {
        key: 'producer_product_id',
        namespace: 'global',
        value: producerProductId,
        type: 'single_line_text_field'
      }
    ];

    tempHubProduct.variants = customVariants.map((v) => ({
      inventory_item: v.variantA.inventory_item,
      metafields: [
        {
          key: 'producer_variant_id',
          namespace: 'global',
          value: v.variantA.id,
          type: 'single_line_text_field'
        }
      ],

      option1: v.variantA.title,
      title: v.variantA.title,
      price: v.price,
      inventory_policy: v.variantB.inventory_policy,
      fulfillment_service: v.variantB.fulfillment_service,
      inventory_management: v.variantB.inventory_management,
      inventory_quantity:
        Number(v.noOfItemPerCase) * Number(v.variantB.inventory_quantity),
      old_inventory_quantity: v.variantB.old_inventory_quantity
    }));

    await tempHubProduct.saveAndUpdate();

    const hubProduct = new shopify.api.rest.Product({
      session
    });

    hubProduct.id = tempHubProduct.id;

    hubProduct.variants = customVariants.map((v) => {
      const exitingImageAlt = productData.images.find((i) =>
        i.variant_ids.includes(v.variantA.id)
      )?.alt;

      const newImageId = exitingImageAlt
        ? tempHubProduct.images.find((i) => i.alt === exitingImageAlt)?.id
        : null;

      return {
        ...tempHubProduct.variants.find(
          (variant) => variant.title === v.variantA.title
        ),
        image_id: newImageId
      };
    });

    await hubProduct.saveAndUpdate();

    hubProduct.variants.forEach(async (variant) => {
      const inventoryItem = new shopify.api.rest.InventoryItem({
        session
      });
      inventoryItem.id = variant.inventory_item_id;
      inventoryItem.tracked =
        customVariants.find((v) => v.variantA.title === variant.title)?.variantB
          ?.tracked || false;
      await inventoryItem.saveAndUpdate();
    });

    const client = await getClient();

    await client.query('BEGIN');

    try {
      const products = await query(
        `
      INSERT INTO products (producer_product_id,hub_product_id) VALUES ($1,$2) returning id;
      `,
        [convertShopifyGraphQLIdToNumber(producerProductId), hubProduct.id],
        client
      );

      const { id: productId } = products.rows[0];

      customVariants.forEach(async (customVariant) => {
        await query(
          `INSERT INTO variants (
            producer_variant_id,
            hub_variant_id,
            product_id,
            price,
            added_value,
            added_value_method,
            original_price,
            no_of_items_per_package,
            mapped_variant_id
            ) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);`,
          [
            convertShopifyGraphQLIdToNumber(customVariant.variantA.id),
            convertShopifyGraphQLIdToNumber(
              hubProduct.variants.find(
                (v) => v.title === customVariant.variantA.title
              ).id
            ),
            productId,
            Number(customVariant.price),
            Number(customVariant.addedValue),
            customVariant.addedValueMethod,
            Number(customVariant.originalPrice),
            Number(customVariant.noOfItemPerCase),
            convertShopifyGraphQLIdToNumber(customVariant.variantB.id)
          ],
          client
        );
      });

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.log('Error creating Shopify product', err);
      throw new Error('Database error:', err);
    } finally {
      client.release();
    }

    return res.json({
      success: true
    });
  } catch (error) {
    console.warn('Could not create Shopify product', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export default createShopifyProduct;
