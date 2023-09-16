import axios from 'axios';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({
  path: join(process.cwd(), '.env')
});

const PRODUCER_SHOP_URL = process.env.PRODUCER_SHOP_URL;
const PRODUCER_SHOP = process.env.PRODUCER_SHOP;

const getFDCProducts = async (req, res, next) => {
  const { nextPageCursor } = req.query;

  const user = req.user;
  const accessToken = user.accessToken;

  try {
    const { data } = await axios.post(
      `${PRODUCER_SHOP_URL}fdc/products?shop=${PRODUCER_SHOP}&nextPageCursor=${nextPageCursor}`,
      {
        userId: user.id,
        accessToken: accessToken
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
