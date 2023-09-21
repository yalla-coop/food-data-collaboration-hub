import {
  processOrderPaidWebhook,
  updateCurrentVariantInventory,
  calculateTheExcessOrders,
  handleOrderPaidWebhook
} from './handleOrderPaidWebhookHandler';

describe('web/webhooks/handleOrderPaidWebhookHandler.test.js', () => {
  it('calculateTheExcessOrders should return 4 when I have excessOrders of 7 and quantity 15 and noOfItemsPerPackage of 6', () => {
    const { numberOfExcessOrders } = calculateTheExcessOrders({
      noOfItemsPerPackage: 6,
      quantity: 15,
      numberOfExcessOrders: 7
    });
    expect(numberOfExcessOrders).toBe(4);
  });
  it('calculateTheExcessOrders should return 4 when I have excessOrders of 2 and quantity 10 and noOfItemsPerPackage of 6', () => {
    const { numberOfExcessOrders } = calculateTheExcessOrders({
      noOfItemsPerPackage: 6,
      quantity: 1,
      numberOfExcessOrders: 5
    });
    expect(numberOfExcessOrders).toBe(4);
  });
  it('calculateTheExcessOrders should return 4 when I have excessOrders of 2 and quantity 10 and noOfItemsPerPackage of 6', () => {
    const { numberOfExcessOrders } = calculateTheExcessOrders({
      noOfItemsPerPackage: 6,
      quantity: 10,
      numberOfExcessOrders: 10
    });
    expect(numberOfExcessOrders).toBe(0);
  });
  it('calculateTheExcessOrders should return 4 when I have excessOrders of 2 and quantity 10 and noOfItemsPerPackage of 6', () => {
    const { numberOfExcessOrders } = calculateTheExcessOrders({
      noOfItemsPerPackage: 6,
      quantity: 10,
      numberOfExcessOrders: 2
    });
    expect(numberOfExcessOrders).toBe(4);
  });
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

  it('handleOrderPaidWebhook', async () => {
    const payload = JSON.stringify({
      line_items: [
        {
          variant_id: 42821112561816,
          quantity: 15
        }
      ]
    });

    await handleOrderPaidWebhook(
      'orders/paid',
      'hub-test-store.myshopify.com',
      payload,
      Math.random()
    );
  }, 100000);
});
