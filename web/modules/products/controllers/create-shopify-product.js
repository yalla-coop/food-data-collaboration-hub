import Shopify from '../../../repositories/shopify/index.js';

const createShopifyProduct = async (req, res, next) => {
  console.log('createShopifyProduct----------------------------------');

  const session = res.locals.shopify.session;

  const {title, price, fdcId} = req.body;
  try {
    let response = await Shopify.createProduct({session, title, price, fdcId: fdcId});
    console.log('Shopify.createProduct response', response);
    console.log('response.body.data.productCreate', response.body.data.productCreate)
    return res.setHeader('Content-Type', 'application/json')
      .end(JSON.stringify(response.body.data.productCreate));

    /*
    return res.end(JSON.stringify({ a: 1 }));
    return res.status(204)
      .setHeader('Content-Type', 'application/json')
      .end(JSON.stringify(JSON.stringify({a: 1})));
    */
  } catch (error) {
    console.warn('Could not create Shopify product', error);
    next(error);
  }
};

export default createShopifyProduct;
