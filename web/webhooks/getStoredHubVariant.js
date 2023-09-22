import { query } from '../database/connect.js';

export const getStoredHubVariant = async ({ variantId }) => {
  const selectVariantQuery = `
    SELECT
    v.*,
    p.producer_product_id,
    p.hub_product_id
    FROM variants as v
    INNER JOIN products as p
      ON v.product_id = p.id
    WHERE hub_variant_id = $1
    `;

  const result = await query(selectVariantQuery, [variantId]);

  if (result.rows.length === 0) {
    throw new Error('Variant not found');
  }

  const { hubProductId, producerProductId } = result.rows[0];
  const mappedProducerVariantId = result.rows[0].mappedVariantId;
  const noOfItemsPerPackage = Number(result.rows[0].noOfItemsPerPackage);
  const numberOfExitingExcessOrders = Number(
    result.rows[0].numberOfExcessOrders
  );
  const numberOfExitingRemainingOrders = Number(
    result.rows[0].numberOfRemainingOrders
  );

  return {
    hubProductId,
    producerProductId,
    hubVariantId: variantId,
    noOfItemsPerPackage,
    mappedProducerVariantId,
    numberOfExitingExcessOrders,
    numberOfExitingRemainingOrders
  };
};
