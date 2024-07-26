import { query } from '../connect.js';
import { getClient } from '../connect.js';

import { createOrUpdate, replaceRefreshToken, getUser } from './users.js';

describe('users', () => {

    let client = null;

    beforeAll(async () => {
        client = await getClient();
    })

    afterAll(async () => {
        await query(`truncate table users`, [], client)
        client.release();
    })

    beforeEach(async () => {
        await query(`truncate table users`, [], client);
    });

    const user = {
        id: 'e5b41da4-2633-412f-8210-1569a2d0ce20',
        refreshToken: 'refreshToken',
        accessToken: 'accessToken',
        accessTokenExpiresAt: '0',
    }

    it('Can be created', async () => {
        expect(await createOrUpdate(user, client)).toStrictEqual(user);
    });

    it('Can be updated', async () => {
        await createOrUpdate(user, client);
        const updated = await createOrUpdate({...user, refreshToken: 'updatedRefreshToken'}, client);
        expect(updated.refreshToken).toBe('updatedRefreshToken');
    });

    it('Refresh token will not be replaced if not necessary', async () => {
        const {id} = await createOrUpdate(user, client);

        async function returnNothing() {
            return Promise.resolve(null);
        }

        const tokens = await replaceRefreshToken(id, returnNothing);

        expect(tokens).toStrictEqual({
            accessToken: 'accessToken',
            accessTokenExpiresAt: '0',
            refreshToken: 'refreshToken'
        });

        expect(await getUser(id)).toStrictEqual(user);
    });

    it('Refresh token will be replaced if necessary', async () => {
        const {id} = await createOrUpdate(user, client);

        const updatedTokens = {
            accessToken: 'updatedAccessToken',
            accessTokenExpiresAt: '500',
            refreshToken: 'updatedRefreshToken'
        }

        async function returnUpdatedTokens() {
            return Promise.resolve(updatedTokens);
        }

        const tokens = await replaceRefreshToken(id, returnUpdatedTokens);

        expect(tokens).toStrictEqual(updatedTokens);


        expect(await getUser(id)).toStrictEqual({
            id,
            ...updatedTokens
        });
    });
});