import axios from 'axios';
import dotenv from 'dotenv';
import { join } from 'path';

import {
  getSuppliedProducts,
  SuppliedProduct,
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
    const suppliedProducts = imports.filter(
      (importedProduct) => importedProduct instanceof SuppliedProduct
    );
    const output = await getSuppliedProducts(suppliedProducts);

    // console.log('suppliedProducts :>> ', suppliedProducts);

    return res.json(data);
  } catch (err) {
    console.error('Error fetching FDC products:', err);
    return next(err);
  }
};

export default getFDCProducts;
