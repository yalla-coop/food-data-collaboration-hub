import { LATEST_API_VERSION } from '@shopify/shopify-api';
import * as dotenv from 'dotenv';
import { join } from 'path';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({
    path: join(process.cwd(), '.env.test')
  });
} else {
  dotenv.config({
    path: join(process.cwd(), '.env')
  });
}

import { shopifyApp } from '@shopify/shopify-app-express';
import { restResources } from '@shopify/shopify-api/rest/admin/2023-01';
import { PostgreSQLSessionStorage } from '@shopify/shopify-app-session-storage-postgresql';

const DB_PATH = process?.env?.DATABASE_URL || '';

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET_KEY } = process.env;

const shopify = shopifyApp({
  api: {
    hostName: process.env?.HOST?.replace(/https?:\/\//, '') || '',
    apiVersion: LATEST_API_VERSION,
    restResources,
    apiKey: SHOPIFY_API_KEY,
    apiSecretKey: SHOPIFY_API_SECRET_KEY,
    billing: undefined,
    scopes: [
      'write_products',
      'read_products',
      'write_draft_orders',
      'write_inventory',
      'read_orders',
      'write_orders'
    ]
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback'
  },
  webhooks: {
    path: '/api/webhooks'
  },
  sessionStorage: new PostgreSQLSessionStorage(DB_PATH)
});

export default shopify;
