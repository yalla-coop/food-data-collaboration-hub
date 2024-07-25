import { query, getClient } from '../connect.js';

export async function createOrUpdate(user, client) {

    const sql =
        `INSERT INTO users (user_id, refresh_token, access_token, access_token_expires_at)
            VALUES ($1, $2, $3, $4)
            on CONFLICT(user_id)
            DO UPDATE SET
            refresh_token = EXCLUDED.refresh_token, access_token = EXCLUDED.access_token, access_token_expires_at = EXCLUDED.access_token_expires_at
            RETURNING user_id as "id", refresh_token as "refreshToken", access_token as "accessToken", access_token_expires_at;`;

    const result = await query(
        sql,
        [user.id, user.refreshToken, user.accessToken, user.accessTokenExpiresAt],
        client
    );

    return result.rows[0];
}

export async function getUser(id, client) {
    const sql =
        `SELECT user_id as "id", refresh_token as "refreshToken", access_token as "accessToken", access_token_expires_at FROM USERS where user_id = $1;`;
    const result = await query(
        sql,
        [id],
        client
    );

    return result.rows[0];
}

export async function replaceRefreshToken(id, obtainNewTokensIfNecessary) {

    const client = await getClient();

    try {
        await client.query('BEGIN')

        const result = await client.query(`SELECT refresh_token as "refreshToken", access_token as "accessToken", access_token_expires_at as "accessTokenExpiresAt" from users where user_id = $1 FOR UPDATE`,
         [id])

         const existingTokens = result.rows[0];

        const newTokens = await obtainNewTokensIfNecessary(existingTokens);

        if (newTokens) {
            await client.query(`UPDATE users set refresh_token = $2, access_token = $3, access_token_expires_at = $4 where user_id = $1`,
                [
                    id,
                    newTokens.refreshToken,
                    newTokens.accessToken,
                    newTokens.accessTokenExpiresAt,
                ])
        }

        await client.query('COMMIT');

        return newTokens || existingTokens;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}