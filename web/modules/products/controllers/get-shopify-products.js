import ProductUseCases from '../use-cases/index.js';

const getShopifyProducts = async (req, res, next) => {
  console.log('getShopifyProducts----------------------------------');

  const session = res.locals.shopify.session;

  const products = await ProductUseCases.getShopifyProducts({session});

  res.locals.products = products;

  // return a 200 response with the products
  return res.status(200).json({products: 'products'});
};

export default getShopifyProducts;
