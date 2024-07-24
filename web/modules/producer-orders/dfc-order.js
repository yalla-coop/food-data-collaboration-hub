import { Offer, Order, OrderLine, SaleSession } from '@datafoodconsortium/connector';
import { loadConnectorWithResources } from '../../connector/index.js';

const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env

export async function createNewOrderGraph(salesSession, orderLines) {

    const connector = await loadConnectorWithResources();

    const lines = orderLines.flatMap(createOrderLineGraph(connector));

    const order = new Order({
        connector,
        semanticId: `${PRODUCER_SHOP_URL}api/dfc/Enterprises/${PRODUCER_SHOP}/Orders/#`,
        lines: lines.filter((item) => item instanceof OrderLine),
        orderStatus: connector.VOCABULARY.STATES.ORDERSTATE.HELD
    });

    const salesSessionInfo = new SaleSession({
        connector,
        semanticId: `${PRODUCER_SHOP_URL}api/dfc/Enterprises/${PRODUCER_SHOP}/SalesSession/#`,
        beginDate: salesSession.startDate.toString(),
        endDate: salesSession.endDate.toString(),
    });

    return await connector.export([order, ...lines, salesSessionInfo]);
}

export async function createUpdatedOrderGraph(orderId, orderLines, isComplete) {

    const connector = await loadConnectorWithResources();

    const lines = orderLines.flatMap(createOrderLineGraph(connector, orderId));

    const order = new Order({
        connector,
        semanticId: `${PRODUCER_SHOP_URL}api/dfc/Enterprises/${PRODUCER_SHOP}/Orders/${orderId}`,
        lines: lines.filter((item) => item instanceof OrderLine),
        orderStatus: isComplete ? connector.VOCABULARY.STATES.ORDERSTATE.COMPLETE : connector.VOCABULARY.STATES.ORDERSTATE.HELD
    });

    return await connector.export([order, ...lines]);
}

export async function extractOrder(orderGraph) {
    const connector = await loadConnectorWithResources();

    const deserialised = await connector.import(orderGraph);

    const orders = deserialised.filter(
        (item) => item instanceof Order
    );

    return orders[0];
}

function createOrderLineGraph(connector, orderId) {
    return (line, i) => {
        const suppliedProduct = connector.createSuppliedProduct({
            semanticId: `${PRODUCER_SHOP_URL}api/dfc/Enterprises/${PRODUCER_SHOP}/SuppliedProducts/${line.mappedProducerVariantId}`
        });

        const offer = new Offer({
            connector,
            semanticId: `${PRODUCER_SHOP_URL}api/dfc/Enterprises/${PRODUCER_SHOP}/Offers/${i+1}`,
            offeredItem: suppliedProduct
        });

        const orderLine = new OrderLine({
            connector,
            semanticId: `${PRODUCER_SHOP_URL}api/dfc/Enterprises/${PRODUCER_SHOP}/Orders/${orderId || '#'}/OrderLines/${line.id ? line.id : i+1}`,
            quantity: line.numberOfPackages,
            offer
        });

        return [offer, orderLine, suppliedProduct]
    }
}