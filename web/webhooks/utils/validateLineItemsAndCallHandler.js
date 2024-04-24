import { query } from '../../database/connect.js';

const selectVariantsQuery = `
SELECT
  v.*,
  p.producer_product_id,
  p.hub_product_id
FROM variants as v
INNER JOIN products as p
ON v.product_id = p.id
WHERE hub_variant_id = ANY($1)
`;

const selectActiveSalesSessionQuery = `
SELECT
  *
FROM sales_sessions
WHERE is_active = true
`;

export const validateLineItemsAndCallHandler = async (
  webhookInputs,
  webhookCallback
) => {
  try {
    if (!webhookInputs?.body || !webhookCallback) {
      return {
        statusCode: 200,
        body: 'Webhook - validateLineItemsAndCallHandler: Invalid input'
      };
    }
    const { rows: activeSalesSessions } = await query(
      selectActiveSalesSessionQuery,
      []
    );

    if (activeSalesSessions?.length < 1) {
      return {
        statusCode: 200,
        body: 'Webhook - validateLineItemsAndCallHandler: No active sales session found'
      };
    }

    const payload = JSON.parse(webhookInputs.body);

    const variantsFromPayload = payload.line_items.map((lineItem) => ({
      variantId: lineItem.variant_id,
      quantity: Number(lineItem.quantity)
    }));

    const { rows: variantsFromDB } = await query(selectVariantsQuery, [
      variantsFromPayload.map((v) => v.variantId)
    ]);

    if (variantsFromDB?.rows?.length === 0) {
      return {
        statusCode: 200,
        body: 'Webhook - validateLineItemsAndCallHandler: No matching variants found'
      };
    }

    webhookCallback({
      ...webhookInputs,
      payload,
      activeSalesSessions,
      variantsFromPayload,
      variantsFromDB
    });
  } catch (error) {
    return {
      statusCode: 200,
      body: 'Webhook - validateLineItemsAndCallHandler: Error occurred while validating the payload'
    };
  }
};
