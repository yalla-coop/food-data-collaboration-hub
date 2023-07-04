import shopify from '../shopify.js';

import {catalog} from '../ofn/api/catalog_1_7.js';

import {Session} from '@shopify/shopify-api';

const PRODUCTS_QUERY = `
{
  products(first: 5) {
    edges {
      node {
        id
        description
        descriptionHtml
        productType
        title
        totalInventory
        status
        handle
        metafields(first: 10) {
          edges {
            node {
              id
            }
          }
        }
        priceRange {
          maxVariantPrice {
            amount
            currencyCode
          }
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}
`;

export function applyProductPublicEndpoints(app) {
  /*
    The URL for fetching the products this shop provides to 
  */
  app.get('/api/products', async (req, res) => {
    //console.log('/api/products req', req)

    let session = new Session({
      id: 'test-session',
      isOnline: false,
      shop: 'yalla-cooperative.myshopify.com'
      //state: '1234',
      // accessToken: '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'
    });

    const client = new shopify.api.clients.Graphql({
      session: session
      //session: res.locals.shopify.session,
    });

    const response = await client.query({
      data: {
        query: PRODUCTS_QUERY,
        variables: {
          //first: 2,
        }
      }
    });

    let page = response.body?.data?.products;
    let products = page?.edges;

    let suppliedProducts = [];

    /*
    console.log('suppliedProducts ', suppliedProducts )
    for (const product of products) {

      let suppliedProduct = createSuppliedProduct(product.node)
      console.log('connector.export', await connector.export(suppliedProduct, 2))
      //console.log('product is', product)
    }
    */

    catalog['@graph'].push(...suppliedProducts);

    res.setHeader('Content-Type', 'application/json');
    res.send(catalog);
  });
}
