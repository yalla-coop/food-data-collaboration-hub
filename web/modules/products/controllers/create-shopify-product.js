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

    const { title, handle, producerProductId, variantsMappingData } =
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

    const parentProduct = variantsMappingData.parentProduct;
    const retailProduct = variantsMappingData.retailProduct;
    const wholesaleProduct = variantsMappingData.wholesaleProduct;

    tempHubProduct.title = title;
    tempHubProduct.body_html = parentProduct.body_html;
    tempHubProduct.images = parentProduct.images;

    tempHubProduct.handle = handle;
    tempHubProduct.metafields = [
      {
        key: 'producer_product_id',
        namespace: 'global',
        value: producerProductId,
        type: 'single_line_text_field'
      }
    ];

    tempHubProduct.variants = [{
      inventory_item: retailProduct.inventory_item,
      metafields: [
        {
          key: 'producer_variant_id',
          namespace: 'global',
          value: retailProduct.id,
          type: 'single_line_text_field'
        }
      ],

      option1: retailProduct.title,
      title: retailProduct.title,
      price: variantsMappingData.price,
      inventory_policy: wholesaleProduct.inventory_policy,
      fulfillment_service: wholesaleProduct.fulfillment_service,
      inventory_management: wholesaleProduct.inventory_management,
      inventory_quantity:
        Number(variantsMappingData.noOfItemPerCase) * Number(wholesaleProduct.inventory_quantity),
      old_inventory_quantity: wholesaleProduct.old_inventory_quantity
    }];

    await tempHubProduct.saveAndUpdate();

    const hubProduct = new shopify.api.rest.Product({
      session
    });

    hubProduct.id = tempHubProduct.id;

    const exitingImageAlt = parentProduct.images[0]?.alt;

    const newImageId = exitingImageAlt
      ? tempHubProduct.images.find((i) => i.alt === exitingImageAlt)?.id
      : null;

    hubProduct.variants = [{
      ...tempHubProduct.variants[0],
      image_id: newImageId
    }];

    await hubProduct.saveAndUpdate();

    const inventoryItem = new shopify.api.rest.InventoryItem({
      session
    });
    inventoryItem.id = hubProduct.variants[0].inventory_item_id;
    inventoryItem.tracked = true;
    await inventoryItem.saveAndUpdate();

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
          convertShopifyGraphQLIdToNumber(retailProduct.id),
          convertShopifyGraphQLIdToNumber(
            hubProduct.variants[0].id
          ),
          productId,
          Number(variantsMappingData.price),
          Number(variantsMappingData.addedValue),
          variantsMappingData.addedValueMethod,
          Number(variantsMappingData.originalPrice),
          Number(variantsMappingData.noOfItemPerCase),
          convertShopifyGraphQLIdToNumber(wholesaleProduct.id)
        ],
        client
      );

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
