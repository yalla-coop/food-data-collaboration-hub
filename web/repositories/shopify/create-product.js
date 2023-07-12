import getClient from './get-client.js';
import {CREATE_PRODUCT} from './queries/CREATE_PRODUCT.js';

export const createProduct = async ({session}) => {
  const client = getClient(session);

  const response = await client.query({
    data: {
      query: CREATE_PRODUCT
    },
    variables: {
      input: {
        title: 'My new product',
        description: 'This is a new product',
        /*
        variants: [
          {
            price: '10.00',
            sku: '123'
          }
        ]
        */
      }
    }
  });

  let data = response.body?.data;
  console.log('create product response data', data);
  //let products = page?.edges;

  //return products;
};
