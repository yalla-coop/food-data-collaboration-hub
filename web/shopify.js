import '@shopify/shopify-api/adapters/node';
import {} from '@shopify/shopify-api';
import { BillingInterval, LATEST_API_VERSION } from '@shopify/shopify-api';
import sqlite3 from 'sqlite3';

import { shopifyApp } from '@shopify/shopify-app-express';
import { SQLiteSessionStorage } from '@shopify/shopify-app-session-storage-sqlite';
import { restResources } from '@shopify/shopify-api/rest/admin/2023-01';
import { config } from './config.js';

const DB_PATH =
  process.env.NODE_ENV === 'test'
    ? `${process.cwd()}/web/test-database.sqlite`
    : `${process.cwd()}/database.sqlite`;

import { DB } from './db.js';

const database = new sqlite3.Database(DB_PATH);

// Initialize SQLite DB
DB.db = database;
DB.init();

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
    apiVersion: LATEST_API_VERSION,
    restResources,
    apiKey: config.SHOPIFY_API_KEY,
    apiSecretKey: config.SHOPIFY_API_SECRET_KEY,
    billing: undefined,
    scopes: ['write_products', 'read_products', 'write_draft_orders']
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback'
  },
  webhooks: {
    path: '/api/webhooks'
  },
  sessionStorage: new SQLiteSessionStorage(DB_PATH)
});

export default shopify;
