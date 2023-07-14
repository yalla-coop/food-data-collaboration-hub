import getClient from './get-client.js';
import {DELETE_PRODUCT} from './queries/DELETE_PRODUCT.js';

export const deleteProduct = async ({session, id}) => {
  const client = getClient(session);

  const response = await client.query({
    data: {
      query: DELETE_PRODUCT
    },
    variables: {
      input: {
        id: id
      }
    }
  });

  //let data = response.body?.data;
  console.log('delete product response', response);
  //let products = page?.edges;

  //return products;
};
