import getClient from './get-client.js';
import {CREATE_PRODUCT} from './queries/CREATE_PRODUCT.js';

export const createProduct = async ({session, title, price}) => {
  const client = getClient(session);

  try {
    return await client.query({
      data: {
        query: CREATE_PRODUCT,
        variables: {
          input: {
            title: title,
            variants: [{ price: price }],
          },
        }
      },
    });
  } catch (error) {
    console.warn('Could not create Shopify product', error);
  }
};
