import { throwError } from '../../utils/index.js';
import { query } from '../../database/connect.js';
import { calculatePackageAndExcessItemsAfterCancelledOrder } from './calculatePackageAndExcessItemsAfterCancelledOrder.js';
import { calculatePackageAndExcessItemsAfterCompletedOrder } from './calculatePackageAndExcessItemsAfterCompletedOrder.js';

const updateVariantQuery = `
UPDATE variants
SET number_of_excess_orders = $1
WHERE hub_variant_id = $2
`;

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

    await sqlClient.query('BEGIN');
    await query(
      updateVariantQuery,
      [numberOfExcessItems, hubVariantId],
      sqlClient
    );
    await sqlClient.query('COMMIT');

    const stockData = {
      noOfItemsPerPackage,
      numberOfPackages,
      numberOfExcessItems,
      mappedProducerVariantId,
      hubVariantId,
      hubProductId,
      producerProductId
    };
    console.log(
      `handleOrderWebhook via handleStockAfterOrderUpdate: updated excess items value for hubVariantId: ${hubVariantId}`
    );
    return stockData;
  } catch (error) {
    await sqlClient.query('ROLLBACK');
    throwError('handleStockAfterOrderUpdate error from catch', error);
  }
};
