import {BillingInterval} from '@shopify/shopify-api';
import {shopifyApp} from '@shopify/shopify-app-express';
import {SQLiteSessionStorage} from '@shopify/shopify-app-session-storage-sqlite';
import {restResources} from '@shopify/shopify-api/rest/admin/2023-01';

import {config} from './config.js';

const DB_PATH = `${process.cwd()}/database.sqlite`;

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  'My Shopify One-Time Charge': {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: 'USD',
    interval: BillingInterval.OneTime
  }
};

const shopify = shopifyApp({
  api: {
    apiVersion: '2023-01',
    restResources,
    billing: undefined, // or replace with billingConfig above to enable example billing
    //apiKey: '',
    //apiSecretKey: '',

    accessToken: config.SHOPIFY_ACCESS_TOKEN,
    scopes: ['write_products', 'read_products', 'write_orders', 'read_orders']
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback'
  },
  webhooks: {
    path: '/api/webhooks'
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage: new SQLiteSessionStorage(DB_PATH)
});

export default shopify;
