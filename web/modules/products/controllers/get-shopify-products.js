import ProductUseCases from '../use-cases/index.js';

const getShopifyProducts = async (req, res, next) => {
  console.log('getShopifyProducts----------------------------------');

  const session = res.locals.shopify.session;

  const products = await ProductUseCases.getShopifyProducts({ session });

  console.log('shopify products are', products);
  res.locals.products = products;

  res.set('content-type', 'application/json');
  return res.status(200).send(products);
};

export default getShopifyProducts;
