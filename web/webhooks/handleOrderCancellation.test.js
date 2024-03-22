import { handleOrderCancellation } from './handleOrderCancellation.js';

describe('handleOrderCancellation', () => {
  //   it('should throw an error for invalid input', () => {
  //     expect(() => {
  //       handleOrderCancellation({
  //         noOfItemsPerPackage: 0,
  //         quantityToBeCancelled: 2,
  //         numberOfExistingExcessItems: 9
  //       });
  //     }).toThrowError('Invalid input for handleOrderCancellation');
  //   });

  it('should calculate the correct number of packages and excess Items 1', () => {
    const result = handleOrderCancellation({
      noOfItemsPerPackage: 10,
      quantityToBeCancelled: 2,
      numberOfExistingExcessItems: 9
    });

    expect(result.numberOfPackages).toBe(1);
    expect(result.numberOfExcessItems).toBe(1);
  });

  it('should calculate the correct number of packages and excess Items 2', () => {
    const result = handleOrderCancellation({
      noOfItemsPerPackage: 10,
      quantityToBeCancelled: 3,
      numberOfExistingExcessItems: 0
    });

    expect(result.numberOfPackages).toBe(1);
    expect(result.numberOfExcessItems).toBe(7);
  });
});
