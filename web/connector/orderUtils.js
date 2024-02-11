import { loadConnectorWithResources, OrderLine, Person } from './index.js';

const semanticIdPrefix = process.env.PRODUCER_SHOP_URL;

function createDFCLinesOrder(lineItems, connector, semanticId) {
  const linesOrder = [];
  lineItems.forEach((lineItem) => {
    const orderLine = new OrderLine({
      connector,
      semanticId: `${semanticId}/lineItem/${lineItem.variant_id}`,
      quantity: lineItem.quantity
    });

    linesOrder.push(orderLine);
  });
  return linesOrder;
}

function createDFCConnectorOrder(shopifyOrder, connector) {
  const semanticId = `${semanticIdPrefix}order/${shopifyOrder.id}`;

  const linesOrder = createDFCLinesOrder(
    shopifyOrder.lineItems,
    connector,
    semanticId
  );

  return linesOrder;
}

async function exportDFCConnectorOrder(shopifyOrder) {
  try {
    const connector = await loadConnectorWithResources();
    const DFCLines = createDFCConnectorOrder(shopifyOrder, connector);

    return await connector.export(DFCLines);
  } catch (error) {
    throw new Error('Error exporting DFCOrder:', error);
  }
}

export async function exportDFCConnectorCustomer(shopifyOrder) {
  try {
    const connector = await loadConnectorWithResources();

    const DFCCustomer = new Person({
      connector,
      semanticId: `${semanticIdPrefix}order/${shopifyOrder.id}/person/${shopifyOrder.customer.email}`,
      firstName: shopifyOrder.customer.first_name,
      lastName: shopifyOrder.customer.email
    });

    return await connector.export([DFCCustomer]);
  } catch (error) {
    throw new Error('Error exporting DFCOrder:', error);
  }
}

export default exportDFCConnectorOrder;
