import axios from 'axios';
import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';
import { join } from 'path';
import { throwError } from '../../../utils/index.js';

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
      `${PRODUCER_SHOP_URL}fdc/orders/${producerOrderId}/complete?shop=${PRODUCER_SHOP}&orderType=completed`,
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
    Sentry.captureException(err);
    throwError(
      'completeOrderAtProducerStoreUseCase: Error occurred while completing the order at producer store',
      err
    );
  }
};

export default completeOrderAtProducerStoreUseCase;
