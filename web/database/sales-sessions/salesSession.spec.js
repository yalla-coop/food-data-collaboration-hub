import { createSalesSession, deactivateAllSalesSessions, getMostRecentActiveSalesSession, addProducerOrder, replaceRefreshToken} from './salesSession.js'
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

    const salesSession = {
        startDate,
        endDate,
        sessionDurationInDays: 12,
        active: true
    };

    const user = {
        refreshToken: 'refreshToken',
        accessToken: 'accessToken',
        accessTokenExpiresAt: '0',
    }

    it('Can be created', async () => {
        
        const result = await createSalesSession(salesSession, user, client);

        expect(result).toStrictEqual({
            id: 1,
            endDate,
            startDate,
            isActive: true,
            sessionDuration: 12,
            orderId: null,
            creatorRefreshToken: 'refreshToken',
            creatorAccessToken: 'accessToken',
            creatorAccessTokenExpiresAt: '0',
        });
    });

    it('Can be deactivated', async () => {
        await createSalesSession(salesSession, user, client);

        const result = await deactivateAllSalesSessions(client);

        expect(result[0].isActive).toBe(false);
    });

    it('Can retrieve most recent active sales sessions', async () => {
        await createSalesSession({
            ...salesSession,
            endDate: new Date('2024-02-20T01:00:00+00:00'),
        }, user, client);

        const latestSession = await createSalesSession({
            ...salesSession,
            endDate: new Date('2024-02-25T01:00:00+00:00'),
        }, user, client);

        const activeSalesSession = await getMostRecentActiveSalesSession(client);

        expect(activeSalesSession.endDate).toStrictEqual(latestSession.endDate);
    });

    it('Returns undefined when no sales session', async () => {
        const activeSalesSessions = await getMostRecentActiveSalesSession();
        expect(activeSalesSessions).toStrictEqual(undefined);
    });

    it('Producer order id can be recorded', async () => {
        const {id} = await createSalesSession(salesSession, user, client);

        const orderId = '123456';

        await addProducerOrder(id, orderId, client);
        const activeSalesSession = await getMostRecentActiveSalesSession(client);

        expect(activeSalesSession.orderId).toStrictEqual(orderId);
    });

    it('Refresh token will not be replaced if not necessary', async () => {
        const {id} = await createSalesSession(salesSession, user, client);

        async function returnNothing() {
            return Promise.resolve(null);
        }

        const tokens = await replaceRefreshToken(id, returnNothing, client);

        expect(tokens).toStrictEqual({
            accessToken: 'accessToken',
            accessTokenExpiresAt: '0',
            refreshToken: 'refreshToken'
        });


        const activeSalesSession = await getMostRecentActiveSalesSession(client);

        expect(activeSalesSession.creatorAccessToken).toStrictEqual('accessToken');
        expect(activeSalesSession.creatorAccessTokenExpiresAt).toStrictEqual('0');
        expect(activeSalesSession.creatorRefreshToken).toStrictEqual('refreshToken');
    });

    it('Refresh token will be replaced if necessary', async () => {
        const {id} = await createSalesSession(salesSession, user, client);

        const updatedTokens = {
            accessToken: 'updatedAccessToken',
            accessTokenExpiresAt: '500',
            refreshToken: 'updatedRefreshToken'
        }

        async function returnUpdatedTokens() {
            return Promise.resolve(updatedTokens);
        }

        const tokens = await replaceRefreshToken(id, returnUpdatedTokens, client);

        expect(tokens).toStrictEqual(updatedTokens);


        const activeSalesSession = await getMostRecentActiveSalesSession(client);

        expect(activeSalesSession.creatorAccessToken).toStrictEqual('updatedAccessToken');
        expect(activeSalesSession.creatorAccessTokenExpiresAt).toStrictEqual('500');
        expect(activeSalesSession.creatorRefreshToken).toStrictEqual('updatedRefreshToken');
    });

})