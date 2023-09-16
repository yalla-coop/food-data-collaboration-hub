import { deleteVariantsAndProductCachedData } from './handleProductDeleteWebhookHandler.js';

describe('handleProductDeleteWebhookHandler', () => {
  it('should be tested', async () => {
    await deleteVariantsAndProductCachedData(7723053449368);
  });
});
