export const calculateTheExcessOrders = ({
  noOfItemsPerPackage,
  quantity,
  numberOfExitingExcessOrders
}) => {
  if (
    quantity <= 0 ||
    numberOfExitingExcessOrders < 0 ||
    noOfItemsPerPackage <= 0
  ) {
    throw new Error(`Invalid input for calculateTheExcessOrders with values 
    noOfItemsPerPackage: ${noOfItemsPerPackage},
    quantity: ${quantity},
    numberOfExitingExcessOrders: ${numberOfExitingExcessOrders}
    `);
  }

  const totalOrdersForThisVariant = quantity - numberOfExitingExcessOrders; // 10

  if (totalOrdersForThisVariant <= 0) {
    return {
      numberOfExcessOrders: Math.abs(totalOrdersForThisVariant),
      numberOfPackages: 0
    };
  }

  const numberOfPackages = Math.ceil(
    totalOrdersForThisVariant / noOfItemsPerPackage
  ); // 2

  const numberOfExcessOrdersAfterThisOrder =
    numberOfPackages * noOfItemsPerPackage - totalOrdersForThisVariant; // 2

  return {
    numberOfPackages,
    numberOfExcessOrders: numberOfExcessOrdersAfterThisOrder
  };
};
