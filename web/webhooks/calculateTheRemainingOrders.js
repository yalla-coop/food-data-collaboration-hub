export const calculateTheRemainingOrders = ({
  noOfItemsPerPackage, // 6
  quantity, // 5
  numberOfExitingRemainingOrders // 2
}) => {
  if (
    quantity <= 0 ||
    numberOfExitingRemainingOrders < 0 ||
    noOfItemsPerPackage <= 0
  ) {
    throw new Error(`Invalid input for calculateTheRemainingOrders with values 
    noOfItemsPerPackage: ${noOfItemsPerPackage},
    quantity: ${quantity},
    numberOfExitingRemainingOrders: ${numberOfExitingRemainingOrders}
    `);
  }

  const totalOrders = quantity + numberOfExitingRemainingOrders; // 7

  const numberOfPackages = Math.floor(totalOrders / noOfItemsPerPackage); // 1

  const numberOfRemainingOrdersAfterThisOrder =
    totalOrders % noOfItemsPerPackage; // 1

  return {
    numberOfPackages,
    numberOfRemainingOrders: numberOfRemainingOrdersAfterThisOrder
  };
};
