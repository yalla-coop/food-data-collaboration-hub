import UseCases from '../use-cases/index.js';
import {getOfflineAccessTokenByShopName} from '../../../repositories/shopify/get-offline-access-token-by-shop-name.js';
import { config } from '../../../config.js';

const getFDCProducts = async (req, res, next) => {
  console.log('getFDCProducts----------------------------------');

  //return res.status(200).json({products: 'products'});


  try {
    const products = await UseCases.getFDCProducts();
    console.log('getFDCProducts products', products)
    // retuen products string
    res.set('content-type', 'application/ld+json');
    return res.status(200).send(products);
    //return res.status(200).json(products);
  } catch (error) {
    console.warn('Error getting FDC products', error);
    return next(error);
  }

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
