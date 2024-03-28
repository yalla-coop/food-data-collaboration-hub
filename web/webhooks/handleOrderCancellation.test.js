import { handleOrderCancellation } from './handleOrderCancellation.js';

describe('handleOrderCancellation', () => {
  it('should throw an error for invalid input', () => {
    expect(() => {
      handleOrderCancellation({
        noOfItemsPerPackage: 0,
        quantityToBeCancelled: 2,
        numberOfExistingExcessItems: 9
      });
    }).toThrowError('Invalid input. Inputs must be positive numbers.');
  });

  it('should calculate the correct number of packages and excess Items 1', () => {
    const result = handleOrderCancellation({
      noOfItemsPerPackage: 10,
      quantityToBeCancelled: 3,
      numberOfExistingExcessItems: 7
    });

    expect(result.packagesToCancel).toBe(1);
    expect(result.newExcessItems).toBe(0);
  });

  it('should calculate the correct number of packages and excess Items 2', () => {
    const result = handleOrderCancellation({
      noOfItemsPerPackage: 10,
      quantityToBeCancelled: 5,
      numberOfExistingExcessItems: 0
    });

    expect(result.packagesToCancel).toBe(0);
    expect(result.newExcessItems).toBe(5);
  });
  it('should calculate the correct number of packages and excess Items 3', () => {
    const result = handleOrderCancellation({
      noOfItemsPerPackage: 10,
      quantityToBeCancelled: 15,
      numberOfExistingExcessItems: 1
    });

    expect(result.packagesToCancel).toBe(1);
    expect(result.newExcessItems).toBe(6);
  });
});
