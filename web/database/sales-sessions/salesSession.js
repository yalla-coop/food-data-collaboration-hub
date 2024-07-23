import { query, getClient } from '../connect.js';

const returnColumns = 'id, start_date, end_date, session_duration, is_active, order_id, creator_refresh_token, creator_access_token, creator_access_token_expires_at'

export async function createSalesSession({ startDate, endDate, sessionDurationInDays, active }, { refreshToken, accessToken, accessTokenExpiresAt }, client) {
  const sql =
    `INSERT INTO sales_sessions (start_date, end_date, session_duration, creator_refresh_token, creator_access_token, creator_access_token_expires_at, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING ${returnColumns}`;
  const result = await query(
    sql,
    [
      startDate.toISOString(),
      endDate.toISOString(),
      sessionDurationInDays,
      refreshToken,
      accessToken,
      accessTokenExpiresAt,
      active
    ],
    client
  );

  return result.rows[0];
}

export async function deactivateAllSalesSessions(client) {
  const result = await query(
    `UPDATE sales_sessions SET is_active = false WHERE is_active = true
         RETURNING ${returnColumns}`,
    [],
    client
  );
  return result.rows;
}

export async function getMostRecentActiveSalesSession(client) {
  const sql =
    `SELECT ${returnColumns} FROM sales_sessions WHERE is_active = true ORDER BY end_date DESC LIMIT 1`;
  const result = await query(sql, [], client);
  return result.rows[0];
}

export async function addProducerOrder(id, orderId, client) {
  const sql = `UPDATE sales_sessions set order_id = $2 where id = $1
               RETURNING ${returnColumns} `;
  const result = await query(
    sql,
    [
      id,
      orderId
    ],
    client
  );

  return result.rows[0];
}

export async function replaceRefreshToken(id, obtainNewTokensIfNecessary) {

  const client = await getClient()

  try {
    await client.query('BEGIN')

    const result = await client.query(`SELECT creator_refresh_token, creator_access_token, creator_access_token_expires_at from sales_sessions where id = $1`, [id])

    const data = result.rows[0];

    const existingTokens = {
      refreshToken: data.creatorRefreshToken,
      accessToken: data.creatorAccessToken,
      accessTokenExpiresAt: data.creatorAccessTokenExpiresAt,
    };

    const newTokens = await obtainNewTokensIfNecessary(existingTokens);

    if (newTokens) {
      await client.query(`UPDATE sales_sessions set creator_refresh_token = $2, creator_access_token = $3, creator_access_token_expires_at = $4 where id = $1`,
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
  } finally {
    client.release();
  }
}