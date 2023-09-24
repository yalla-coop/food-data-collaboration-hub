import axios from 'axios';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({
  path: join(process.cwd(), '.env')
});

const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env;

const getFDCProducts = async (req, res, next) => {
  const { sinceId } = req.query;
  const {
    user: { accessToken, id: userId }
  } = req;

  try {
    const { data } = await axios.post(
      `${PRODUCER_SHOP_URL}fdc/products?shop=${PRODUCER_SHOP}&sinceId=${sinceId}`,
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

    return res.json(data);
  } catch (err) {
    console.log('err', err);
    return next(err);
  }
};

export default getFDCProducts;
