import FDC from '../../../repositories/fdc/index.js';
import {getOfflineAccessTokenByShopName} from '../../../repositories/shopify/get-offline-access-token-by-shop-name.js';

const getFDCProducts = async (req, res, next) => {
  console.log('getFDCProducts----------------------------------');

  return res.status(200).json({products: 'products'});

  /*
  try {
    const {order, shopName} = req.fdc;

    await orderSchema.validate(order);

    const accessToken = await getOfflineAccessTokenByShopName(shopName);
    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: `No access token found for store ${shopName}`
      });
    }

    //const products = await FDC.getProducts();

    await OrderUseCases.createDraftOrder({
      order,
      shopName,
      accessToken
    });

    return res.status(200).json({
      success: true,
      message: 'Order retrieved successfully'
    });
  } catch (error) {
    return next(error);
  }
  */
};

export default getFDCProducts;
