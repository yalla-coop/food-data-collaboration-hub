import { Offer, Order, OrderLine, SaleSession } from '@datafoodconsortium/connector';
import {loadConnectorWithResources} from '../../connector/index.js';

export async function createNewOrderGraph(salesSession, orderLines) {

    const connector = await loadConnectorWithResources();

    const lines = (orderLines.map(line => {
        orderLine1Request = new OrderLine({
            connector,
            semanticId: `${PRODUCER_SHOP_URL}api/dfc/Enterprises/${PRODUCER_SHOP}/Orders/#/orderlines/#`,
            quantity: line.numberOfPackages,
            offer: new Offer({ connector, semanticId: `${PRODUCER_SHOP_URL}api/dfc/Enterprises/${PRODUCER_SHOP}/SuppliedProducts/${line.mappedProducerVariantId}` })
        })
    }));

    const order = new Order({
        connector,
        semanticId: 'http://test.host/api/dfc/Enterprises/Orders/#',
        lines: lines,
        orderStatus: connector.VOCABULARY.STATES.ORDERSTATE.HELD
    });

    const salesSessionInfo = new SaleSession({
        connector,
        semanticId: 'http://test.host/api/dfc/SalesSession/#',
        beginDate: salesSession.endDate.toString(),
        endDate: salesSession.startDate.toString(),
    });

    return await connector.export([order, ...lines, salesSessionInfo]);
}

export async function createUpdatedOrderGraph(orderId, orderLines, isComplete) {

    const connector = await loadConnectorWithResources();

    const lines = (orderLines.map(line => {
        orderLine1Request = new OrderLine({
            connector,
            semanticId: `${PRODUCER_SHOP_URL}api/dfc/Enterprises/${PRODUCER_SHOP}/Orders/#/orderlines/${line.id ? line.id : '#'}`,
            quantity: line.numberOfPackages,
            offer: new Offer({ connector, semanticId: `${PRODUCER_SHOP_URL}api/dfc/Enterprises/${PRODUCER_SHOP}/SuppliedProducts/${line.mappedProducerVariantId}` })
        })
    }));

    const order = new Order({
        connector,
        semanticId: `${PRODUCER_SHOP_URL}api/dfc/Enterprises/${PRODUCER_SHOP}/Orders/${orderId}`,
        lines: lines,
        orderStatus: isComplete ? connector.VOCABULARY.STATES.ORDERSTATE.COMPLETE : connector.VOCABULARY.STATES.ORDERSTATE.HELD
    });

    return await connector.export([order, ...lines]);
}



export async function extractOrder(orderGraph){
    const connector = await loadConnectorWithResources();

    const deserialised = await connector.import(orderGraph);

    const orders = deserialised.filter(
        (item) => item instanceof Order
    );

    return orders[0];
}