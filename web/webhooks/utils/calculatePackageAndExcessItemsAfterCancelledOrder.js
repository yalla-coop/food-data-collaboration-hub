// @params {number} noOfItemsPerPackage - number of items per package to order from producer
// @params {number} quantityToBeCancelled - items of cancellation order
// @params {number} numberOfExistingExcessItems - excess items from previous orders
// @returns {number} - numberOfExcessItems - number of excess items after cancellation
// @returns {number} - numberOfPackages - number of packages to cancel from producer
export function calculatePackageAndExcessItemsAfterCancelledOrder({
  noOfItemsPerPackage,
  quantity: quantityToBeCancelled,
  numberOfExistingExcessItems
}) {
  if (
    typeof noOfItemsPerPackage !== 'number' ||
    typeof quantityToBeCancelled !== 'number' ||
    typeof numberOfExistingExcessItems !== 'number' ||
    noOfItemsPerPackage <= 0 ||
    quantityToBeCancelled < 0 ||
    numberOfExistingExcessItems < 0
  ) {
    throw new Error('Invalid input. Inputs must be positive numbers.');
  }

  const totalExcessItems = quantityToBeCancelled + numberOfExistingExcessItems;
  const numberOfPackages = Math.floor(totalExcessItems / noOfItemsPerPackage);
  const numberOfExcessItems = totalExcessItems % noOfItemsPerPackage;

  return {
    numberOfExcessItems,
    numberOfPackages
  };
}
