import Shopify from '../../../repositories/shopify/index.js';

const createShopifyProduct = async (req, res, next) => {
  console.log('createShopifyProduct----------------------------------');

  const session = res.locals.shopify.session;

  const { title, price, fdcId } = req.body;
  try {
    let response = await Shopify.createProduct({
      session,
      title,
      price,
      fdcId: fdcId
    });
    return res
      .setHeader('Content-Type', 'application/json')
      .end(JSON.stringify(response.body.data.productCreate));
  } catch (error) {
    console.warn('Could not create Shopify product', error);
    next(error);
  }
};

export default createShopifyProduct;
