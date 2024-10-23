import axios from 'axios';
import dotenv from 'dotenv';
import { join } from 'path';
import { generateShopifyFDCProducts } from '../../../connector/productUtils.js';
import { obtainValidAccessTokenOrDeleteSessionOnFailure } from '../../authentication/getNewAccessToken.js';

dotenv.config({
  path: join(process.cwd(), '.env')
});

const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env;

const getFDCProducts = async (req, res, next) => {
  // const { sinceId, remainingProductsCountBeforeNextFetch } = req.query;

  try {
    const accessToken = await obtainValidAccessTokenOrDeleteSessionOnFailure(req);

    const { data } = await axios.get(
      `${PRODUCER_SHOP_URL}api/dfc/Enterprises/${PRODUCER_SHOP}/SuppliedProducts`,
      {
        transformResponse: (res) => {
          return res;
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'JWT ' + accessToken
        }
      }
    );

    const products = await generateShopifyFDCProducts(data);

    return res.json(products);
  } catch (err) {
    console.error('get-fdc-products error: ', err);
    return next(err);
  }
};

export default getFDCProducts;
