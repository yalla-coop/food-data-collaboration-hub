import Shopify from '../../../repositories/shopify/index.js';

const createShopifyProduct = async (req, res, next) => {
  console.log('createShopifyProduct----------------------------------');

  const session = res.locals.shopify.session;

  const {title, price} = req.body;
  let response = await Shopify.createProduct({session, title, price});
  console.log('Shopify.createProduct response', response);

  return res.status(204).json({});
};

export default createShopifyProduct;
