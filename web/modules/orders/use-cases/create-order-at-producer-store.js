import axios from 'axios';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({
  path: join(process.cwd(), '.env')
});

const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env;

const createOrderAtProducerStore = async ({ user }) => {
  const { accessToken } = user;

  try {
    const { data } = await axios.post(
      `${PRODUCER_SHOP_URL}fdc/orders?shop=${PRODUCER_SHOP}`,
      {
        userId: user.id,
        accessToken
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return data;
  } catch (err) {
    console.log('err from axios', err);
    throw new Error(err);
  }
};

export default createOrderAtProducerStore;
