/* eslint-disable no-undef */
import handleOrderPaidWebhook from './handleOrderPaidWebhookHandler';

describe.skip('web/webhooks/handleOrderPaidWebhookHandler.test.js', () => {
  it('handleOrderPaidWebhook', async () => {
    const payload = JSON.stringify({
      line_items: [
        {
          variant_id: 42830062336,
          quantity: 12
        },
        {
          variant_id: 42830046104,
          quantity: 6
        }
      ]
    });

    await handleOrderPaidWebhook.callback(
      'orders/paid',
      'hub-test-store.myshopify.com',
      payload,
      Math.random()
    );
  }, 100000);
});
