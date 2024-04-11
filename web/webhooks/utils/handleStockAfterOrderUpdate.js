import { throwError } from '../../utils/index.js';

import { calculatePackageAndExcessItemsAfterCancelledOrder } from './calculatePackageAndExcessItemsAfterCancelledOrder.js';
import { calculatePackageAndExcessItemsAfterCompletedOrder } from './calculatePackageAndExcessItemsAfterCompletedOrder.js';
import { updateVariantExcessItems } from './updateVariantExcessItems.js';

export const handleStockAfterOrderUpdate = async ({
  orderType,
  variantFromOrder,
  variantFromDB,
  sqlClient
}) => {
  try {
    if (!orderType) {
      throwError('handleStockAfterOrderUpdate: Missing orderType');
    }
    if (!variantFromOrder || !variantFromDB) {
      throwError(
        'handleStockAfterOrderUpdate: Missing variant data from order or DB'
      );
    }
    if (!variantFromOrder?.variantId || !variantFromOrder?.quantity) {
      throwError('handleStockAfterOrderUpdate: Missing variantId or quantity');
    }

    const { variantId: hubVariantId, quantity } = variantFromOrder;

    const { hubProductId, producerProductId } = variantFromDB;
    const mappedProducerVariantId = variantFromDB.mappedVariantId;
    const noOfItemsPerPackage = Number(variantFromDB.noOfItemsPerPackage);
    const numberOfExistingExcessItems = Number(
      variantFromDB.numberOfExcessOrders
    );

    const currentStockVars = {
      noOfItemsPerPackage,
      quantity,
      numberOfExistingExcessItems
    };
    let updatedStockData = null;

    if (orderType === 'cancelled') {
      updatedStockData =
        calculatePackageAndExcessItemsAfterCancelledOrder(currentStockVars);
    } else {
      updatedStockData =
        calculatePackageAndExcessItemsAfterCompletedOrder(currentStockVars);
    }

    const { numberOfExcessItems, numberOfPackages } = updatedStockData;
    const noCallToProducer = numberOfPackages === 0;
    // update the hub variant with the new excess items directly if no producer request is sent
    if (
      noCallToProducer &&
      numberOfExistingExcessItems !== numberOfExcessItems
    ) {
      await updateVariantExcessItems({
        numberOfExcessItems,
        hubVariantId,
        sqlClient
      });
    }
    const stockData = {
      noOfItemsPerPackage,
      numberOfPackages,
      numberOfExcessItems,
      mappedProducerVariantId,
      hubVariantId,
      hubProductId,
      producerProductId
    };

    return stockData;
  } catch (error) {
    throwError('handleStockAfterOrderUpdate error from catch', error);
  }
};
