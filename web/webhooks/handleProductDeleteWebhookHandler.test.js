import { deleteVariantsAndProductCachedData } from './handleProductDeleteWebhookHandler.js';

//todo flawed test

describe.skip('handleProductDeleteWebhookHandler', () => {
  it('should be tested', async () => {
    await deleteVariantsAndProductCachedData(7723053449368);
  });
});
