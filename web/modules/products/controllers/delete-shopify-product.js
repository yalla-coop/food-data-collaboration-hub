import Shopify from '../../../repositories/shopify/index.js';

const deleteShopifyProduct = async (req, res, next) => {
  console.log('deleteShopifyProduct----------------------------------');

  const session = res.locals.shopify.session;

  const {shopifyId} = req.body;

  try {
    await Shopify.deleteProduct({session, id: shopifyId});
    return res.status(204).json({});
  } catch (error) {
    console.warn('Could not delete Shopify product', shopifyId, error);
    return next(error);
  }
};

export default deleteShopifyProduct;
