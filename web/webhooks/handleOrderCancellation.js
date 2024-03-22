// @params {number} noOfItemsPerPackage - number of items per package to order from producer
// @params {number} quantityToBeCancelled - items of new order
// @params {number} numberOfExistingExcessItems - excess items from previous orders
// @returns {number} - number of packages to be ordered from producer and excess items after this order
// @returns {number} numberOfPackages - number of packages to be ordered from producer
export function handleOrderCancellation({
  noOfItemsPerPackage,
  quantityToBeCancelled,
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

  // Calculate the total excess items after cancellation
  const totalExcessItems = quantityToBeCancelled + numberOfExistingExcessItems;
  // Calculate how many packages can be cancelled
  const packagesToCancel = Math.floor(totalExcessItems / noOfItemsPerPackage);
  // Calculate the new excess items after cancellation
  const newExcessItems = totalExcessItems % noOfItemsPerPackage;
  return {
    newExcessItems,
    packagesToCancel
  };
}
