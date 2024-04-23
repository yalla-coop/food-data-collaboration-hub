import { calculatePackageAndExcessItemsAfterCancelledOrder } from './calculatePackageAndExcessItemsAfterCancelledOrder';

describe('calculatePackageAndExcessItemsAfterCancelledOrder', () => {
  it('should throw an error for invalid input', () => {
    expect(() => {
      calculatePackageAndExcessItemsAfterCancelledOrder({
        noOfItemsPerPackage: 0,
        quantity: 2,
        numberOfExistingExcessItems: 9
      });
    }).toThrowError('Invalid input. Inputs must be positive numbers.');
  });

  it('should calculate the correct number of packages and excess Items 1', () => {
    const result = calculatePackageAndExcessItemsAfterCancelledOrder({
      noOfItemsPerPackage: 10,
      quantity: 3,
      numberOfExistingExcessItems: 7
    });

    expect(result.numberOfPackages).toBe(1);
    expect(result.numberOfExcessItems).toBe(0);
  });

  it('should calculate the correct number of packages and excess Items 2', () => {
    const result = calculatePackageAndExcessItemsAfterCancelledOrder({
      noOfItemsPerPackage: 10,
      quantity: 5,
      numberOfExistingExcessItems: 0
    });

    expect(result.numberOfPackages).toBe(0);
    expect(result.numberOfExcessItems).toBe(5);
  });
  it('should calculate the correct number of packages and excess Items 3', () => {
    const result = calculatePackageAndExcessItemsAfterCancelledOrder({
      noOfItemsPerPackage: 10,
      quantity: 15,
      numberOfExistingExcessItems: 1
    });

    expect(result.numberOfPackages).toBe(1);
    expect(result.numberOfExcessItems).toBe(6);
  });
});
