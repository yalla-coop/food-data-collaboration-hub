import axios from 'axios';
import dotenv from 'dotenv';
import { join } from 'path';
import * as Sentry from '@sentry/node';
import { throwError } from '../../../utils/index.js';
import { createHubCustomerDetails } from '../../../utils/createHubCustomerDetails.js';

dotenv.config({
  path: join(process.cwd(), '.env')
});

const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env;

const createOrderAtProducerStore = async ({ user }) => {
  const { accessToken } = user;
  const shop = process.env.HUB_SHOP_NAME;
  const customer = createHubCustomerDetails(shop);

  try {
    const { data } = await axios.post(
      `${PRODUCER_SHOP_URL}fdc/orders?shop=${PRODUCER_SHOP}`,
      {
        userId: user.id,
        accessToken,
        customer
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
    throwError('Error creating order at producer store', err);
  }
};

export default createOrderAtProducerStore;
