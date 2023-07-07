
/* Fixes error in shopify-app-express where the shop query parameter is not added to the request object when the app is embedded */
const addSessionShopToReqParams = (req, res, next) => {
  const shop = res.locals?.shopify?.session?.shop;
  if (shop && !req.query.shop) {
    req.query.shop = shop;
  }
  return next();
}

export default addSessionShopToReqParams;