import getClient from './get-client.js';
import {DELETE_PRODUCT} from './queries/DELETE_PRODUCT.js';

export const deleteProduct = async ({session}) => {
  const client = getClient(session);

  const response = await client.query({
    data: {
      query: DELETE_PRODUCT
    },
    variables: {
      input: {
        id: 'gid://shopify/Product/6628569655363'
      }
    }
  });

  //let data = response.body?.data;
  console.log('delete product response', response);
  //let products = page?.edges;

  //return products;
};
