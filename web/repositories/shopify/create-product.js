import getClient from './get-client.js';
import {CREATE_PRODUCT} from './queries/CREATE_PRODUCT.js';

export const createProduct = async ({session, title, price, fdcId}) => {
  const client = getClient(session);

  try {
    return await client.query({
      data: {
        query: CREATE_PRODUCT,
        variables: {
          input: {
            title: title,
            variants: [{
              price: price,
            }],
            metafields: [{key: "fdcId", namespace: "fdc", value: fdcId, type: "single_line_text_field"}]
          },
        }
      },
    });
  } catch (error) {
    console.warn('Could not create Shopify product', error);
  }
};
