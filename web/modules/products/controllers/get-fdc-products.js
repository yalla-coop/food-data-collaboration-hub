import axios from 'axios';
import dotenv from 'dotenv';
import { join } from 'path';

import {
  getSuppliedProducts,
  importSuppliedProducts
} from '../../../connector/index.js';

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

    const imports = await importSuppliedProducts(data.exportedDFCProducts);

    const suppliedProducts = await getSuppliedProducts(imports);

    console.log(
      'suppliedProducts :>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>> ',
      suppliedProducts
    );

    return res.json(data);
  } catch (err) {
    console.log(
      'GET FDC PRODUCTS err :>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>>:>> ',
      err
    );
    return next(err);
  }
};

export default getFDCProducts;
