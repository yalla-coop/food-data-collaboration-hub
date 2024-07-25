import { query, getClient } from '../connect.js';

const encryptionKey = process.env.SESSION_SIGNING_KEY;

export async function createOrUpdate(user, client) {

    const sql =
        `INSERT INTO users (user_id, refresh_token, access_token, access_token_expires_at)
            VALUES ($1, pgp_sym_encrypt($2, $5), pgp_sym_encrypt($3, $5), $4)
            on CONFLICT(user_id)
            DO UPDATE SET
            refresh_token = EXCLUDED.refresh_token, access_token = EXCLUDED.access_token, access_token_expires_at = EXCLUDED.access_token_expires_at
            RETURNING user_id as "id", pgp_sym_decrypt(refresh_token::bytea, $5) as "refreshToken", pgp_sym_decrypt(access_token::bytea, $5) as "accessToken", access_token_expires_at;`;

    const result = await query(
        sql,
        [user.id, user.refreshToken, user.accessToken, user.accessTokenExpiresAt, encryptionKey],
        client
    );

    return result.rows[0];
}

export async function getUser(id, client) {
    const sql =
        `SELECT user_id as "id", pgp_sym_decrypt(refresh_token::bytea, $2) as "refreshToken", pgp_sym_decrypt(access_token::bytea, $2) as "accessToken", access_token_expires_at FROM USERS where user_id = $1;`;
    const result = await query(
        sql,
        [id, encryptionKey],
        client
    );

    return result.rows[0];
}

export async function replaceRefreshToken(id, obtainNewTokensIfNecessary) {

    const client = await getClient()

    try {
        await client.query('BEGIN')

        const result = await client.query(`SELECT pgp_sym_decrypt(refresh_token::bytea, $2) as "refreshToken", pgp_sym_decrypt(access_token::bytea, $2) as "accessToken", access_token_expires_at from users where user_id = $1 FOR UPDATE`,
         [id, encryptionKey])

        const existingTokens = result.rows[0];

        const newTokens = await obtainNewTokensIfNecessary(existingTokens);

        if (newTokens) {
            await client.query(`UPDATE users set refresh_token = pgp_sym_encrypt($2, $5), access_token = pgp_sym_encrypt($3, $5), access_token_expires_at = $4 where user_id = $1`,
                [
                    id,
                    newTokens.refreshToken,
                    newTokens.accessToken,
                    newTokens.accessTokenExpiresAt,
                    encryptionKey
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