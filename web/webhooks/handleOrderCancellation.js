// calculates the total items that can be fulfilled with the existing excess items
// if we don't have enough excess items to fulfill the new order
// we will order more packages from the producer
// @params {number} noOfItemsPerPackage - number of items per package to order from producer
// @params {number} quantityToBeCancelled - items of new order
// @params {number} numberOfExistingExcessItems - excess items from previous orders
// @returns {number} - number of packages to be ordered from producer and excess items after this order
// @returns {number} numberOfPackages - number of packages to be ordered from producer

export const handleOrderCancellation = ({
  noOfItemsPerPackage,
  quantityToBeCancelled,
  numberOfExistingExcessItems
}) => {
  if (
    quantityToBeCancelled <= 0 ||
    numberOfExistingExcessItems < 0 ||
    noOfItemsPerPackage <= 0
  ) {
    throw new Error(`Invalid input for handleOrderCancellation with values
    noOfItemsPerPackage: ${noOfItemsPerPackage},
    quantityToBeCancelled: ${quantityToBeCancelled},
    numberOfExistingExcessItems: ${numberOfExistingExcessItems}
    `);
  }

  if (quantityToBeCancelled <= numberOfExistingExcessItems) {
    return {
      numberOfPackages: 1,
      numberOfExcessItems: numberOfExistingExcessItems - quantityToBeCancelled
    };
  }

  const totalOrdersForThisVariant =
    quantityToBeCancelled + numberOfExistingExcessItems; // 3 + 0 = 3
  console.log('totalOrdersForThisVariant :>> ', totalOrdersForThisVariant);

  const numberOfPackagesToBeCancelled = Math.floor(
    totalOrdersForThisVariant / noOfItemsPerPackage
  ); // 3 / 10 = 0,3

  console.log(
    'numberOfPackagesToBeCancelled  :>> ',
    numberOfPackagesToBeCancelled
  );

  const numberOfExcessItemsAfterThisOrder =
    totalOrdersForThisVariant -
    numberOfPackagesToBeCancelled * noOfItemsPerPackage; //  - 10 = 1

  console.log(
    'numberOfExcessItemsAfterThisOrder :>> ',
    numberOfExcessItemsAfterThisOrder
  );

  return {
    numberOfPackages: numberOfPackagesToBeCancelled,
    numberOfExcessItems: numberOfExcessItemsAfterThisOrder
  };
};
