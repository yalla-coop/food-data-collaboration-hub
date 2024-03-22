// calculates the total items that can be fulfilled with the existing excess items
// if we don't have enough excess items to fulfill the new order
// we will order more packages from the producer
// @params {number} noOfItemsPerPackage - number of items per package to order from producer
// @params {number} quantity - items of new order
// @params {number} numberOfExistingExcessOrders - excess items from previous orders
// @returns {number} - number of packages to be ordered from producer and excess items after this order
// @returns {number} numberOfPackages - number of packages to be ordered from producer

export const calculateTheExcessOrders = ({
  noOfItemsPerPackage,
  quantity,
  numberOfExistingExcessOrders
}) => {
  if (
    quantity <= 0 ||
    numberOfExistingExcessOrders < 0 ||
    noOfItemsPerPackage <= 0
  ) {
    throw new Error(`Invalid input for calculateTheExcessOrders with values
    noOfItemsPerPackage: ${noOfItemsPerPackage},
    quantity: ${quantity},
    numberOfExistingExcessOrders: ${numberOfExistingExcessOrders}
    `);
  }

  const totalOrdersForThisVariant = quantity - numberOfExistingExcessOrders;

  if (totalOrdersForThisVariant <= 0) {
    return {
      numberOfExcessOrders: Math.abs(totalOrdersForThisVariant),
      numberOfPackages: 0
    };
  }

  const numberOfPackages = Math.ceil(
    totalOrdersForThisVariant / noOfItemsPerPackage
  );

  const numberOfExcessOrdersAfterThisOrder =
    numberOfPackages * noOfItemsPerPackage - totalOrdersForThisVariant; // 2

  return {
    numberOfPackages,
    numberOfExcessOrders: numberOfExcessOrdersAfterThisOrder
  };
};
