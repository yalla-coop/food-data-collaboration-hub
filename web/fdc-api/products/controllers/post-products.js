import ProductUseCases from '../use-cases/index.js';

const postShopifyProducts = async (req, res, next) => {
  console.log('postProducts----------------------------------');

  const products = await ProductUseCases.postProducts({ session });

  res.locals.products = products;

  // return a 204 response with the products
  return res.status(204).json({ products: 'products' });
};

export default getShopifyProducts;
