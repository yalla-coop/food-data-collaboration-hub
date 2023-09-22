import { updateCurrentVariantInventory } from './updateCurrentVariantInventory.js';

describe('updateCurrentVariantInventory', () => {
  it('should update the inventory of a variant', async () => {
    await updateCurrentVariantInventory(
      {
        hubProductId: 7727323447448,
        producerProductId: 8140849185075,
        hubVariantId: 42822766755992,
        noOfItemsPerPackage: 6,
        mappedProducerVariantId: 44519466271027,
        numberOfExcessOrders: 5,
        numberOfRemainingOrders: 0,
        isPartiallySoldCasesEnabled: true,
        shouldUpdateThePrice: true,
        hubVariant: {
          price: '10.00',
          addedValue: '0.00',
          addedValueMethod: 'fixed'
        }
      },
      100000
    );
  });
});
