import {loadConnectorWithResources, Order, SaleSession} from '../../connector/index.js';
import {createNewOrderGraph} from './dfc-order.js'

describe('dfc-order', () => {
    it('Can create an order creation graph', async () => {

        const connector = await loadConnectorWithResources();

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

        const graph = await createNewOrderGraph(salesSession, lineItems);

        const items = await connector.import(graph);

        const order = items.filter(
            (item) => item instanceof Order
        )[0];
    
        const saleSession = items.filter(
            (item) => item instanceof SaleSession
        )[0];

        expect(await order.getSemanticId()).toBe('http://madeupproducer.com/api/dfc/Enterprises/made-up-shop/Orders/#');

        const lines = await order.getLines();
        expect(await lines).toHaveLength(2);

        const line = lines[0];
        expect(await line.getSemanticId()).toBe('http://madeupproducer.com/api/dfc/Enterprises/made-up-shop/Orders/#/OrderLines/1')

        const offer = await line.getOffer();
        expect(await offer.getSemanticId()).toBe('http://madeupproducer.com/api/dfc/Enterprises/made-up-shop/Offers/1')
        
        const product = await offer.getOfferedItem();
        expect(await product.getSemanticId()).toBe('http://madeupproducer.com/api/dfc/Enterprises/made-up-shop/SuppliedProducts/12345')
        
        expect(saleSession.getEndDate()).toBe('Wed Mar 20 2024 00:00:00 GMT+0000 (Greenwich Mean Time)');

    }, 20000)
})