import shopify from '../../../shopify.js';
import { query } from '../../../database/connect.js';

const convertShopifyGraphQLIdToNumber = (id) => {
  if (!id) return null;
  if (typeof id === 'number') return id;
  return parseInt(id.split('/').pop());
};

const createShopifyProduct = async (req, res, next) => {
  try {
    const session = res.locals.shopify.session;

    const { title, handle, variants, producerProductId } = req.body;

    // check if the producerProductId is already in the database

    const productExists = await query(
      `
    SELECT * FROM products WHERE producer_product_id = $1;
    `,
      [convertShopifyGraphQLIdToNumber(producerProductId)]
    );

    console.log('productExists', productExists.rows.length);

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
    product.variants = variants;

    product.variants?.forEach((variant) => {
      variant.metafields = [
        {
          key: 'producer_variant_id',
          namespace: 'global',
          value: variant.id,
          type: 'single_line_text_field'
        }
      ];
    });

    await product.saveAndUpdate({
      update: true
    });

    // save this product id to my database
    try {
      await query(
        `
      INSERT INTO products (producer_product_id,hub_product_id) VALUES ($1,$2);
      `,
        [convertShopifyGraphQLIdToNumber(producerProductId), product.id]
      );
    } catch (err) {
      throw new Error('Data base error:', err);
    }

    return res.json({
      success: true
    });
  } catch (error) {
    console.warn('Could not create Shopify product', JSON.stringify(error));
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export default createShopifyProduct;
