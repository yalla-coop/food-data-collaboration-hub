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

    const { title, handle, variants, producerProductId } = req.body;

    const productExists = await query(
      `
    SELECT * FROM products WHERE producer_product_id = $1;
    `,
      [convertShopifyGraphQLIdToNumber(producerProductId)]
    );

    if (productExists.rows.length > 0) {
      throw new Error('Product already exists');
    }

    const product = new shopify.api.rest.Product({
      session
    });

    product.title = title;
    product.handle = handle;
    product.metafields = [
      {
        key: 'producer_product_id',
        namespace: 'global',
        value: producerProductId,
        type: 'single_line_text_field'
      }
    ];
    product.variants = variants.map((variant) => ({
      ...variant,
      inventory_item: variant.inventoryItem,
      inventory_policy: variant.inventoryPolicy,
      metafields: [
        {
          key: 'producer_variant_id',
          namespace: 'global',
          value: variant.id,
          type: 'single_line_text_field'
        }
      ],
      inventory_policy: variant.inventoryPolicy,
      compare_at_price: variant.compareAtPrice,
      fulfillment_service: variant.fulfillmentService,
      inventory_management: variant.inventoryManagement,
      inventory_quantity: variant.inventoryQuantity,
      old_inventory_quantity: variant.oldInventoryQuantity,
      requires_shipping: variant.requiresShipping
    }));

    await product.saveAndUpdate({
      update: true
    });

    for (let variant of product.variants) {
      const inventory_item = new shopify.api.rest.InventoryItem({
        session
      });
      inventory_item.id = variant.inventory_item_id;
      inventory_item.tracked =
        variants.find((v) => v.title === variant.title)?.inventoryItem
          .tracked || false;
      await inventory_item.saveAndUpdate();
    }

    const client = await getClient();

    await client.query('BEGIN');

    try {
      const products = await query(
        `
      INSERT INTO products (producer_product_id,hub_product_id) VALUES ($1,$2) returning id;
      `,
        [convertShopifyGraphQLIdToNumber(producerProductId), product.id],
        client
      );

      const { id: productId } = products.rows[0];

      for (let i = 0; i < variants.length; i++) {
        await query(
          `INSERT INTO variants (producer_variant_id,hub_variant_id,product_id,price,added_value,added_value_method,original_price) VALUES ($1,$2,$3,$4,$5,$6,$7);`,
          [
            convertShopifyGraphQLIdToNumber(variants[i].id),
            convertShopifyGraphQLIdToNumber(product.variants[i].id),
            productId,
            Number(variants[i].price),
            Number(variants[i].addedValue),
            variants[i].addedValueMethod,
            Number(variants[i].originalPrice)
          ],
          client
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
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
