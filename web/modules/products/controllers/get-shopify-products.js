import ProductUseCases from '../use-cases/index.js';

const getShopifyProducts = async (req, res, next) => {
  console.log('getShopifyProducts----------------------------------');

  const session = res.locals.shopify.session;

  const products = await ProductUseCases.getShopifyProducts({session});

  res.locals.products = products;

  next();
};

export default getShopifyProducts;
