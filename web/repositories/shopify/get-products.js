import getClient from './get-client.js';
import { GET_PRODUCTS_QUERY } from './queries/GET_PRODUCTS_QUERY.js';

export const getProducts = async ({ session }) => {
  const client = getClient(session);

  const response = await client.query({
    data: {
      query: GET_PRODUCTS_QUERY
    }
  });

  let page = response.body?.data?.products;
  let products = page?.edges;

  return products;
};
