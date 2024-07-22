
import { handleNewOrder } from './newOrder'
import {loadConnectorWithResources} from '../../connector/index.js';
import { Offer, Order, OrderLine, SuppliedProduct } from '@datafoodconsortium/connector';
import { getClient } from '../../database/connect.js';
jest.mock('../../modules/authentication/getNewAccessToken');
import { getNewAccessToken } from '../../modules/authentication/getNewAccessToken'
jest.mock('./dfc-order')
import { createOrderGraph, extractOrder } from './dfc-order'
jest.mock('../../database/producer-order-lines/producerOrderLines')
import { recordOrderLines } from '../../database/producer-order-lines/producerOrderLines'
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

    it('When first order of a sales session, creates new order at producer', async () => {

        const startDate = new Date('2024-03-14T01:00:00+01:00');
        const endDate = new Date('2024-03-20T01:00:00+01:00');

        const salesSession = {
            id: '1234',
            orderId: null,
            creatorRefreshToken: 'refresh',
            startDate,
            endDate
        }

        const lineItems = [
            { numberOfPackages: 4, mappedProducerVariantId: '12345' },
            { numberOfPackages: 10, mappedProducerVariantId: '6789' },
        ];

        getNewAccessToken.mockResolvedValue('newAccessToken');

        createOrderGraph.mockResolvedValue('complicated DFC order graph');
        extractOrder.mockResolvedValue(await dfcOrder());

        axios.post.mockResolvedValue({ data: [] });

        await handleNewOrder(salesSession, lineItems)

        expect(axios.post).toHaveBeenCalledWith(
            'http://madeupproducer.com/api/dfc/Enterprises/made-up-shop/Orders',
            'complicated DFC order graph',
            {
                transformResponse: expect.anything(),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer newAccessToken'
                }
            }
        )

        expect(recordOrderLines).toHaveBeenCalledWith('1234', expect.arrayContaining([
            { quantity: 4, producerOrderLineId: '1', producerProductId: '12345' },
            { quantity: 10, producerOrderLineId: '2', producerProductId: '6789' }]));

        expect(addProducerOrder).toHaveBeenCalledWith('1234', '1001');
    });

    async function dfcOrder() {
        const connector = await loadConnectorWithResources();

        const lines = [
            dfcLine({ orderId: '1001', lineId: '1', productId: '12345', quantity: 4 }, connector),
            dfcLine({ orderId: '1001', lineId: '2', productId: '6789', quantity: 10 }, connector),
        ];

        return new Order({
            connector,
            semanticId: 'http://test.host/api/dfc/Enterprises/Orders/1001',
            lines: lines,
            orderStatus: connector.VOCABULARY.STATES.ORDERSTATE.HELD
        });
    }

    function dfcLine({ orderId, lineId, productId, quantity }, connector) {
        return new OrderLine({
            connector,
            semanticId: `${process.env.PRODUCER_SHOP_URL}api/dfc/Enterprises/${process.env.PRODUCER_SHOP}/Orders/${orderId}/orderlines/${lineId}`,
            quantity: quantity,
            offer: new Offer({ connector, 
                semanticId: `${process.env.PRODUCER_SHOP_URL}api/dfc/Enterprises/${process.env.PRODUCER_SHOP}/Offers/${productId}`,
                offeredItem: new SuppliedProduct({
                    connector,
                    semanticId: `${process.env.PRODUCER_SHOP_URL}api/dfc/Enterprises/${process.env.PRODUCER_SHOP}/SuppliedProducts/${productId}`
                })

             })
        });

    }
})