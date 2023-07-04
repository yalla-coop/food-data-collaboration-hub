import {
  Session
} from '@shopify/shopify-api';
import { storage } from '../storage.js'
import shopify from "../shopify.js";
import { shopifyClient } from './shopify-client.js';

const PRODUCTS_QUERY = `
{
  products(first: 50) {
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
`

const PRODUCT_METAFIELDS_MUTATION = `
mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      # Metafield fields
    }
    userErrors {
      field
      message
    }
  }
}
`

export function applyProductEndpoints(app) {

  console.log('applyProductEndpoints')

  /*
    The URL for fetching the products this shop provides to 
  */
  app.get("/api/products", async (req, res) => {
    
    console.log('/api/products GET')
    /*
    let session = new Session({
      id: 'test-session',
      isOnline: false,
      shop: 'yalla-cooperative.myshopify.com',
      //state: '1234',
      accessToken: config.SHOPIFY_ACCESS_TOKEN
    })

    const client = new shopify.api.clients.Graphql({
      session: session
      //session: res.locals.shopify.session,
    });
    */

    const response = await shopifyClient.query({
      data: {
        query: PRODUCTS_QUERY,
        variables: {
        },
      },
    });

    let page = response.body?.data?.products
    //let products = page?.edges
    console.log('page is', page.edges[0].node)
    let products = page?.edges.map(p => {
      console.log('p is', p)
      const key = `product/${p.id}`
      let product = storage.getItem(key)
      if (product) {
        for (const [key, value] of Object.entries(product)) {
          p.node[key] = value
        }
      }
      return p.node
    })

    //let suppliedProducts = products.map(p => createSuppliedProduct(p.node))

    res.setHeader('Content-Type', 'application/json')
    res.send(products)
  });

  app.patch("/api/products/:uid", async (req, res) => {
    console.log('PATCH /api/products', req.params.uid, req.body)
    let status = 200
    let error = null

    try {
      // TODO make work for multiple users
      const key = `product/${req.params.uid}`
      const product = storage.getItem(key)
      for (const [key, value] of Object.entries(req.body)) {
        product[key] = value
      }
      storage.setItem(key, product)
    } catch (e) {
      console.log(`Failed to update product ${req.params.uid}: ${e.message}`)
      status = 500
      error = e.message
    }
    res.status(status).send({ success: status === 200, error })
  })
}