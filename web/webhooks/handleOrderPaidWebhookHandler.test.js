import {
  processOrderPaidWebhook,
  updateCurrentVariantInventory
} from './handleOrderPaidWebhookHandler';

describe('web/webhooks/handleOrderPaidWebhookHandler.test.js', () => {
  it('updateCurrentVariantInventory', async () => {
    await updateCurrentVariantInventory({
      hubVariantId: 42818522120344,
      mappedProducerVariantId: 44519466860851,
      noOfItemsPerPackage: 6,
      producerProductId: 8140849348915,
      hubProductId: 7724759974040
    });
    expect(true).toBe(true);
  });

  it('should be able to run tests', async () => {
    await processOrderPaidWebhook({
      variantId: 42818474246296,
      quantity: 15
    });

    expect(true).toBe(true);
  });
});
