
import { handleNewOrder, completeOrder } from './order'
import { loadConnectorWithResources } from '../../connector/index.js';
import { Offer, Order, OrderLine, SuppliedProduct } from '@datafoodconsortium/connector';
import { getClient } from '../../database/connect.js';
jest.mock('./dfc-order')
import { createNewOrderGraph, createUpdatedOrderGraph, extractOrder } from './dfc-order'
jest.mock('../../database/producer-order-lines/producerOrderLines')
import { recordOrderLines, retrieveOrderLines } from '../../database/producer-order-lines/producerOrderLines'
jest.mock('../../database/sales-sessions/salesSession')
import { addProducerOrder } from '../../database/sales-sessions/salesSession'
import axios from 'axios';
jest.mock('axios');

describe('New Order', () => {

    let sqlClient = null;

    beforeAll(async () => {
        sqlClient = await getClient();
    })

    afterAll(async () => {
        sqlClient.release();
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('When first order of a sales session, creates new order at producer', async () => {
        const salesSession = {
            id: '1234',
            orderId: null,
            creatorRefreshToken: 'refresh',
            startDate: new Date('2024-03-14T01:00:00+01:00'),
            endDate: new Date('2024-03-20T01:00:00+01:00')
        }

        const lineItems = [
            { numberOfPackages: 4, mappedProducerVariantId: '12345' },
            { numberOfPackages: 10, mappedProducerVariantId: '6789' },
        ];

        createNewOrderGraph.mockResolvedValue('complicated DFC order graph');
        extractOrder.mockResolvedValue(await dfcOrder([
            { orderId: '666', lineId: '1', productId: '12345', quantity: 4 },
            { orderId: '666', lineId: '2', productId: '6789', quantity: 10 }
        ]));

        axios.post.mockResolvedValue({ data: [] });

        await handleNewOrder(salesSession, lineItems, 'completed', 'accessToken');

        expect(createNewOrderGraph).toHaveBeenCalledWith(salesSession, lineItems);

        expect(axios.post).toHaveBeenCalledWith(
            'http://madeupproducer.com/api/dfc/Enterprises/made-up-shop/Orders',
            'complicated DFC order graph',
            {
                transformResponse: expect.anything(),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'JWT accessToken'
                }
            }
        )

        expect(recordOrderLines).toHaveBeenCalledWith('1234', expect.arrayContaining([
            { quantity: 4, producerOrderLineId: '1', producerProductId: '12345' },
            { quantity: 10, producerOrderLineId: '2', producerProductId: '6789' }]));

        expect(addProducerOrder).toHaveBeenCalledWith('1234', '666');
    });

    it('When a subsequent order of a sales session, merges existing items with new items and sends new updated order to producer', async () => {
        const salesSession = {
            id: '1234',
            orderId: '666',
            creatorRefreshToken: 'refresh',
            startDate: new Date('2024-03-14T01:00:00+01:00'),
            endDate: new Date('2024-03-20T01:00:00+01:00')
        }

        const newlineItems = [
            { numberOfPackages: 4, mappedProducerVariantId: '12345' },
            { numberOfPackages: 12, mappedProducerVariantId: '999' },
        ];

        retrieveOrderLines.mockResolvedValue([
            { quantity: 4, producerOrderLineId: '1', producerProductId: '12345' },
            { quantity: 10, producerOrderLineId: '2', producerProductId: '6789' }])

        createUpdatedOrderGraph.mockResolvedValue('complicated DFC order graph');
        extractOrder.mockResolvedValue(await dfcOrder([
            { orderId: '666', lineId: '1', productId: '12345', quantity: 8 },
            { orderId: '666', lineId: '2', productId: '6789', quantity: 10 },
            { orderId: '666', lineId: '3', productId: '999', quantity: 12 }
        ]));

        axios.put.mockResolvedValue({ data: [] });

        await handleNewOrder(salesSession, newlineItems, 'completed', 'accessToken');

        expect(createUpdatedOrderGraph).toHaveBeenCalledWith('666', expect.arrayContaining([
            { id: "1", numberOfPackages: 8, mappedProducerVariantId: '12345' },
            { id: "2", numberOfPackages: 10, mappedProducerVariantId: '6789' },
            { numberOfPackages: 12, mappedProducerVariantId: '999' },
        ]), false);

        expect(axios.put).toHaveBeenCalledWith(
            'http://madeupproducer.com/api/dfc/Enterprises/made-up-shop/Orders/666',
            'complicated DFC order graph',
            {
                transformResponse: expect.anything(),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'JWT accessToken'
                }
            }
        );

        expect(recordOrderLines).toHaveBeenCalledWith('1234', expect.arrayContaining([
            { quantity: 8, producerOrderLineId: '1', producerProductId: '12345' },
            { quantity: 10, producerOrderLineId: '2', producerProductId: '6789' },
            { quantity: 12, producerOrderLineId: '3', producerProductId: '999' },
        ]));
    });

    it('When a subsequent order of a sales session is a cancel, dudcts the items from the existing items', async () => {
        const salesSession = {
            id: '1234',
            orderId: '666',
            creatorRefreshToken: 'refresh',
            startDate: new Date('2024-03-14T01:00:00+01:00'),
            endDate: new Date('2024-03-20T01:00:00+01:00')
        }

        const newlineItems = [
            { numberOfPackages: 2, mappedProducerVariantId: '12345' },
            { numberOfPackages: 10, mappedProducerVariantId: '6789' },
        ];

        retrieveOrderLines.mockResolvedValue([
            { quantity: 4, producerOrderLineId: '1', producerProductId: '12345' },
            { quantity: 10, producerOrderLineId: '2', producerProductId: '6789' }])

        createUpdatedOrderGraph.mockResolvedValue('complicated DFC order graph');
        extractOrder.mockResolvedValue(await dfcOrder([
            { orderId: '666', lineId: '1', productId: '12345', quantity: 2 },
        ]));

        axios.put.mockResolvedValue({ data: [] });

        await handleNewOrder(salesSession, newlineItems, 'cancelled', 'accessToken');

        expect(createUpdatedOrderGraph).toHaveBeenCalledWith('666', [
            { id: "1", numberOfPackages: 2, mappedProducerVariantId: '12345' },
        ], false);

        expect(recordOrderLines).toHaveBeenCalledWith('1234', expect.arrayContaining([
            { quantity: 2, producerOrderLineId: '1', producerProductId: '12345' },
        ]));
    })

    it('Order can be completed', async () => {
        const salesSession = {
            id: '1234',
            orderId: '666',
            creatorRefreshToken: 'refresh',
            startDate: new Date('2024-03-14T01:00:00+01:00'),
            endDate: new Date('2024-03-20T01:00:00+01:00')
        }

        retrieveOrderLines.mockResolvedValue([
            { quantity: 4, producerOrderLineId: '1', producerProductId: '12345' },
            { quantity: 10, producerOrderLineId: '2', producerProductId: '6789' }])

        createUpdatedOrderGraph.mockResolvedValue('complicated DFC order graph');

        axios.put.mockResolvedValue({ data: [] });

        await completeOrder(salesSession, 'accessToken');

        expect(createUpdatedOrderGraph).toHaveBeenCalledWith('666', expect.arrayContaining([
            { id: "1", numberOfPackages: 4, mappedProducerVariantId: '12345' },
            { id: "2", numberOfPackages: 10, mappedProducerVariantId: '6789' }
        ]), true);

        expect(axios.put).toHaveBeenCalledWith(
            'http://madeupproducer.com/api/dfc/Enterprises/made-up-shop/Orders/666',
            'complicated DFC order graph',
            {
                transformResponse: expect.anything(),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'JWT accessToken'
                }
            }
        );
    });

    it('Order with no line items is left as it is, for now', async () => {
        const salesSession = {
            id: '1234',
            orderId: '666',
            creatorRefreshToken: 'refresh',
            startDate: new Date('2024-03-14T01:00:00+01:00'),
            endDate: new Date('2024-03-20T01:00:00+01:00')
        }

        retrieveOrderLines.mockResolvedValue([])

        await completeOrder(salesSession, 'accessToken');

        expect(axios.put).not.toHaveBeenCalled();
    })

    async function dfcOrder(lines) {
        const connector = await loadConnectorWithResources();

        const dfcLines = lines.map(line => dfcLine(line, connector));

        return new Order({
            connector,
            semanticId: `${process.env.PRODUCER_SHOP_URL}api/dfc/Enterprises/${process.env.PRODUCER_SHOP}/Orders/666`,
            lines: dfcLines,
            orderStatus: connector.VOCABULARY.STATES.ORDERSTATE.HELD
        });
    }

    function dfcLine({ orderId, lineId, productId, quantity }, connector) {
        return new OrderLine({
            connector,
            semanticId: `${process.env.PRODUCER_SHOP_URL}api/dfc/Enterprises/${process.env.PRODUCER_SHOP}/Orders/${orderId}/orderlines/${lineId}`,
            quantity: quantity,
            offer: new Offer({
                connector,
                semanticId: `${process.env.PRODUCER_SHOP_URL}api/dfc/Enterprises/${process.env.PRODUCER_SHOP}/Offers/${productId}`,
                offeredItem: new SuppliedProduct({
                    connector,
                    semanticId: `${process.env.PRODUCER_SHOP_URL}api/dfc/Enterprises/${process.env.PRODUCER_SHOP}/SuppliedProducts/${productId}`
                })

            })
        });

    }
})