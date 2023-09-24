import axios from 'axios';
import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({
  path: join(process.cwd(), '.env')
});

const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env;

const completeOrderAtProducerStoreUseCase = async ({
  user,
  producerOrderId
}) => {
  const { accessToken } = user;

  try {
    const { data } = await axios.patch(
      `${PRODUCER_SHOP_URL}fdc/orders/${producerOrderId}/complete?shop=${PRODUCER_SHOP}`,
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
    Sentry.captureException(err);
    throw new Error(err);
  }
};

export default completeOrderAtProducerStoreUseCase;
