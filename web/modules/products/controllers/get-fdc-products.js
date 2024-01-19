import axios from 'axios';
import dotenv from 'dotenv';
import { join } from 'path';

import { Connector } from '@datafoodconsortium/connector';

const connector = new Connector();

dotenv.config({
  path: join(process.cwd(), '.env')
});

const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env;

const getFDCProducts = async (req, res, next) => {
  const { sinceId, remainingProductsCountBeforeNextFetch } = req.query;

  const {
    user: { accessToken, id: userId }
  } = req;

  try {
    const { data } = await axios.post(
      `${PRODUCER_SHOP_URL}fdc/products?shop=${PRODUCER_SHOP}&sinceId=${sinceId}&remainingProductsCountBeforeNextFetch=${remainingProductsCountBeforeNextFetch}`,
      {
        userId,
        accessToken
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const dfcTestProductExports = data?.dfcTestProductExports;
    const dfcTestProductImports = await connector.import(dfcTestProductExports);
    console.log('dfcTestProductImports :>> ', dfcTestProductImports);

    return res.json(data);
  } catch (err) {
    console.log('err', err);
    return next(err);
  }
};

export default getFDCProducts;
