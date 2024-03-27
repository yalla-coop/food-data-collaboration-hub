// @params {number} noOfItemsPerPackage - number of items per package to order from producer
// @params {number} quantityToBeCancelled - items of paid/completed hub order
// @params {number} numberOfExistingExcessItems - excess items from previous orders
// @returns {number} - numberOfExcessItems - number of excess items after new order
// @returns {number} - numberOfPackages - number of packages to order from producer to fulfill currrent orders

export const calculatePackageAndExcessItemsAfterCompletedOrder = ({
  noOfItemsPerPackage,
  quantity,
  numberOfExistingExcessItems
}) => {
  if (
    quantity <= 0 ||
    numberOfExistingExcessItems < 0 ||
    noOfItemsPerPackage <= 0
  ) {
    throw new Error(`Invalid input for handlePaidOrderCompletion  with values
    noOfItemsPerPackage: ${noOfItemsPerPackage},
    quantity: ${quantity},
    numberOfExistingExcessItems: ${numberOfExistingExcessItems}
    `);
  }

  const totalOrdersForThisVariant = quantity - numberOfExistingExcessItems; // 10

  if (totalOrdersForThisVariant <= 0) {
    return {
      numberOfExcessItems: Math.abs(totalOrdersForThisVariant),
      numberOfPackages: 0
    };
  }

  const numberOfPackages = Math.ceil(
    totalOrdersForThisVariant / noOfItemsPerPackage
  ); // 2

  const numberOfExcessItems =
    numberOfPackages * noOfItemsPerPackage - totalOrdersForThisVariant; // 2

  return {
    numberOfPackages,
    numberOfExcessItems
  };
};
