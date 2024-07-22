
import { getNewAccessToken } from "../../modules/authentication/getNewAccessToken"
import { createNewOrderGraph, createUpdatedOrderGraph, extractOrder } from "./dfc-order";
import axios from 'axios';
import { recordOrderLines, retrieveOrderLines } from '../../database/producer-order-lines/producerOrderLines'
import { addProducerOrder } from '../../database/sales-sessions/salesSession'

const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env;

export async function handleNewOrder(salesSession, newItems) {
    const accessToken = await getNewAccessToken(salesSession);
    const graph = await buildGraph(salesSession, newItems);

    const { data } = await axios.post(
        `${PRODUCER_SHOP_URL}api/dfc/Enterprises/${PRODUCER_SHOP}/Orders`,
        graph,
        {
            transformResponse: (res) => {
                return res;
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        }
    );

    const order = await extractOrder(data);
    const lines = await order.getLines();

    await recordOrderLines(salesSession.id, await Promise.all(lines.map(extractLineInfo)));

    if (!salesSession.orderId) {
        await addProducerOrder(salesSession.id, extract(order.getSemanticId()));
    }
}

async function buildGraph(salesSession, newItems) {
    if (!salesSession.orderId) {
        return await createNewOrderGraph(salesSession, newItems);
    } else {
        const previouslySentLines = await retrieveOrderLines(salesSession.orderId);
        const neverSeenBeforeItems = newItems.filter(newItem => !previouslySentLines.find(({producerProductId}) => producerProductId === newItem.mappedProducerVariantId));
        const combinedLines = [
            ...previouslySentLines.map(line => {
                const additionalOrderForThisLine = newItems.find(item => item.mappedProducerVariantId === line.producerProductId);
                return {
                    numberOfPackages: additionalOrderForThisLine ? line.quantity + additionalOrderForThisLine.numberOfPackages : line.quantity,
                    mappedProducerVariantId: line.producerProductId,
                    id: line.producerOrderLineId
                }
            }),
            ...neverSeenBeforeItems
        ];
        return await createUpdatedOrderGraph(salesSession.orderId, combinedLines);
    }
}

async function extractLineInfo(dfcOrderLine) {
    const offer = await dfcOrderLine.getOffer();
    const product = await offer.getOfferedItem();
    return {
        producerOrderLineId: extract(dfcOrderLine.getSemanticId()),
        producerProductId: extract(product.getSemanticId()),
        quantity: dfcOrderLine.getQuantity(),
    };
}

export function extract(shopifyId) {
    return shopifyId.substring(shopifyId.lastIndexOf('/') + 1);
}
