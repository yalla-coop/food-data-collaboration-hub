import getClient from './get-client.js';
import {DELETE_PRODUCT} from './queries/DELETE_PRODUCT.js';

export const deleteProduct = async ({session, id}) => {
  const client = getClient(session);

  try {
    return await client.query({
        data: {
          query: DELETE_PRODUCT,
          variables: {
            id: id
          }
        },
    });
  } catch (error) {
    console.warn('Could not delete Shopify product', error.response.errors);
  }
};
