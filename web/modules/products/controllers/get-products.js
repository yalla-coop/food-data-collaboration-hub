import ProductUseCases from '../use-cases/index.js';
const getProducts = async (req, res, next) => {
  console.log('getProducts----------------------------------');

  const session = res.locals.shopify.session;

  const products = await ProductUseCases.getProducts({session});

  res.locals.products = products;

  next();
};

export default getProducts;
