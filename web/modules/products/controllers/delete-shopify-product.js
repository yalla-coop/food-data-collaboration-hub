import Shopify from '../../../repositories/shopify/index.js';

const deleteShopifyProduct = async (req, res, next) => {
  console.log('deleteShopifyProduct----------------------------------');

  const session = res.locals.shopify.session;

  const {id} = req.params;

  console.log('delete id', id)
  try {
    await Shopify.deleteProduct({session, id});
  } catch (error) {
    console.warn('Could not delete Shopify product', error);
    next(error);
  }

  return res.status(204).json({});
};

export default deleteShopifyProduct;
