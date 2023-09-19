import shopify from '../../../shopify.js';
import { getClient, query } from '../../../database/connect.js';

const convertShopifyGraphQLIdToNumber = (id) => {
  if (!id) return null;
  if (typeof id === 'number') return id;
  return parseInt(id.split('/').pop());
};

const createShopifyProduct = async (req, res, next) => {
  try {
    const session = res.locals.shopify.session;

    const { title, handle, producerProductId, customVariants } = req.body;

    const productExists = await query(
      `
    SELECT * FROM products WHERE producer_product_id = $1;
    `,
      [convertShopifyGraphQLIdToNumber(producerProductId)]
    );

    if (productExists.rows.length > 0) {
      throw new Error('Product already exists');
    }

    const hubProduct = new shopify.api.rest.Product({
      session
    });

    hubProduct.title = title;
    hubProduct.handle = handle;
    hubProduct.metafields = [
      {
        key: 'producer_product_id',
        namespace: 'global',
        value: producerProductId,
        type: 'single_line_text_field'
      }
    ];

    hubProduct.variants = customVariants.map((v) => ({
      inventory_item: v.variantA.inventoryItem,
      inventory_policy: v.variantA.inventoryPolicy,
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
      inventory_policy: v.variantA.inventoryPolicy,
      compare_at_price: v.variantA.compareAtPrice,
      fulfillment_service: v.variantA.fulfillmentService,
      inventory_management: v.variantA.inventoryManagement,
      inventory_quantity: v.variantA.inventoryQuantity,
      old_inventory_quantity: v.variantA.oldInventoryQuantity,
      requires_shipping: v.variantA.requiresShipping
    }));

    await hubProduct.saveAndUpdate({
      update: true
    });

    for (let variant of hubProduct.variants) {
      const inventory_item = new shopify.api.rest.InventoryItem({
        session
      });
      inventory_item.id = variant.inventory_item_id;
      inventory_item.tracked =
        customVariants.find((v) => v.variantA.title === variant.title)?.variantA
          ?.inventoryItem?.tracked || false;
      await inventory_item.saveAndUpdate();
    }

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

      for (let customVariant of customVariants) {
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
      }

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
