import { beforeAll, expect, test } from "vitest";
import verifyShopifyWebhook from "./verify-shopify-webhook";
import fs from 'fs'
import path from 'path'

const validHmac = '8RCegHfYHUyU3Y6nwTTAo9L8II8jILfvX2Bo+Z16/hU='
const validRawBody = fs.readFileSync(path.join(__dirname, 'valid-raw-body.bin'))

const shopifyWebhookSecret = '6f9342f916e63bff20e5a7722dbc0ad6a5ee9a476e339bd685714d58c1ce5af4'

test('verify valid body', async () => {
  const result = await verifyShopifyWebhook({ rawBody: validRawBody, hmac: validHmac, shopifyWebhookSecret })
  expect(result).toBe(true);
});