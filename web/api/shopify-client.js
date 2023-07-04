
import {
  Session
} from '@shopify/shopify-api'
import { config } from '../config.js'
import shopify from "../shopify.js"

let session = new Session({
    id: 'test-session',
    isOnline: false,
    shop: 'yalla-cooperative.myshopify.com',
    //state: '1234',
    accessToken: config.SHOPIFY_ACCESS_TOKEN
})

const shopifyClient = new shopify.api.clients.Graphql({
    session: session
})

export { shopifyClient }