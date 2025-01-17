import { createSalesSession, deactivateAllSalesSessions, getMostRecentActiveSalesSession, addProducerOrder} from './salesSession.js'
import { query } from '../connect.js';
import { getClient } from '../connect.js';

describe('sales sessions', () => {

    let client = null;

    const startDate =  new Date('2024-03-14T01:00:00+01:00');
    const endDate =  new Date('2024-03-20T01:00:00+01:00');

    beforeAll(async () => {
        client = await getClient();
    })

    afterAll(async () => {
        await query(`truncate table sales_sessions restart identity`, [], client)
        client.release();
    })

    beforeEach(async () => {
        await query(`truncate table sales_sessions restart identity`, [], client);
    });

    const salesSession = {
        startDate,
        endDate,
        sessionDurationInDays: 12,
        active: true,
        creatorUserId: '1234-5678'
    };


    it('Can be created', async () => {
        
        const result = await createSalesSession(salesSession, client);

        expect(result).toStrictEqual({
            id: 1,
            endDate,
            startDate,
            isActive: true,
            sessionDuration: 12,
            orderId: null,
            creatorUserId: '1234-5678'
        });
    });

    it('Can be deactivated', async () => {
        await createSalesSession(salesSession, client);

        const result = await deactivateAllSalesSessions(client);

        expect(result[0].isActive).toBe(false);
    });

    it('Can retrieve most recent active sales sessions', async () => {
        await createSalesSession({
            ...salesSession,
            endDate: new Date('2024-02-20T01:00:00+00:00'),
        }, client);

        const latestSession = await createSalesSession({
            ...salesSession,
            endDate: new Date('2024-02-25T01:00:00+00:00'),
        }, client);

        const activeSalesSession = await getMostRecentActiveSalesSession(client);

        expect(activeSalesSession.endDate).toStrictEqual(latestSession.endDate);
    });

    it('Returns undefined when no sales session', async () => {
        const activeSalesSessions = await getMostRecentActiveSalesSession();
        expect(activeSalesSessions).toStrictEqual(undefined);
    });

    it('Producer order id can be recorded', async () => {
        const {id} = await createSalesSession(salesSession, client);

        const orderId = '123456';

        await addProducerOrder(id, orderId, client);
        const activeSalesSession = await getMostRecentActiveSalesSession(client);

        expect(activeSalesSession.orderId).toStrictEqual(orderId);
    });

})