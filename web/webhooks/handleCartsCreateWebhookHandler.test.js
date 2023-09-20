import { handleHubVariantUpdate } from './handleCartsCreateWebhookHandler.js';
describe('web/webhooks/handleCartsCreateWebhookHandler', () => {
  it('handleHubVariantUpdate', async () => {
    await handleHubVariantUpdate({
      variantId: 42819902832792,
      quantity: 100
    });
  });
});
