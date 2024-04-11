import { throwError } from '../../utils/index.js';
import { query } from '../../database/connect.js';

const updateVariantQuery = `
UPDATE variants
SET number_of_excess_orders = $1
WHERE hub_variant_id = $2
`;

export const updateVariantExcessItems = async ({
  numberOfExcessItems,
  hubVariantId,
  sqlClient
}) => {
  try {
    if (!numberOfExcessItems || !hubVariantId) {
      throwError(
        'updateVariantExcessItems: Missing numberOfExcessItems or hubVariantId'
      );
    }

    await sqlClient.query('BEGIN');
    const result = await query(
      updateVariantQuery,
      [numberOfExcessItems, hubVariantId],
      sqlClient
    );
    await sqlClient.query('COMMIT');

    return result;
  } catch (error) {
    await sqlClient.query('ROLLBACK');
    throwError('updateVariantExcessItems error from catch', error);
  }
};
