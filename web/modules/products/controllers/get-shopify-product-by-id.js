import shopify from '../../../shopify.js';

const getShopifyProductById = async (req, res, next) => {
  const { session } = res.locals.shopify;
  try {
    await shopify.api.rest.Product.find({
      id: req.params.id,
      session
    });

    return res.json({
      success: true
    });
  } catch (err) {
    console.warn('Could not get Shopify product', err);
    return next(err);
  }
};

export default getShopifyProductById;
