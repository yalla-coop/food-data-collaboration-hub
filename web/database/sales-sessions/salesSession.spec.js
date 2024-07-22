import { createSalesSession, deactivateAllSalesSessions, getMostRecentActiveSalesSession} from './salesSession.js'
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
        client.release();
    })

    beforeEach(async () => {
        await query(`truncate table sales_sessions restart identity`, [], client);
    });

    it('Can be created', async () => {
        const result = await createSalesSession({
            startDate,
            endDate,
            sessionDurationInDays: 12,
            creatorRefreshToken: 'refreshToken',
            active: true
        }, client);

        expect(result).toStrictEqual({
            id: 1,
            endDate,
            startDate,
            isActive: true,
            sessionDuration: 12,
            creatorRefreshToken: 'refreshToken',
        });
    });

    it('Can be deactivated', async () => {
        await createSalesSession({
            startDate,
            endDate,
            sessionDurationInDays: 12,
            creatorRefreshToken: 'refreshToken',
            active: true
        }, client);

        const result = await deactivateAllSalesSessions(client);

        expect(result[0].isActive).toBe(false);
    });

    it('Can retrieve most recent active sales sessions', async () => {
        await createSalesSession({
            startDate,
            endDate: new Date('2024-02-20T01:00:00+00:00'),
            sessionDurationInDays: 12,
            creatorRefreshToken: 'refreshToken',
            active: true
        }, client);

        const latestSession = await createSalesSession({
            startDate,
            endDate: new Date('2024-02-25T01:00:00+00:00'),
            sessionDurationInDays: 12,
            creatorRefreshToken: 'refreshToken',
            active: true
        }, client);

        const activeSalesSessions = await getMostRecentActiveSalesSession(client);

        expect(activeSalesSessions.endDate).toStrictEqual(latestSession.endDate);
    });

    it('Returns undefined when no sales session', async () => {
        const activeSalesSessions = await getMostRecentActiveSalesSession();
        expect(activeSalesSessions).toStrictEqual(undefined);
    });

})