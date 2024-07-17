import { query } from '../connect.js';

const returnColumns = 'id, start_date, end_date, session_duration, creator_refresh_token, is_active'

export async function createSalesSession({startDate, endDate, sessionDurationInDays, active, creatorRefreshToken}, client) {
    const sql =
      `INSERT INTO sales_sessions (start_date, end_date, session_duration, creator_refresh_token, is_active) VALUES ($1,$2,$3,$4,$5)
       RETURNING ${returnColumns}`;
    const result = await query(
      sql,
      [
        startDate.toISOString(),
        endDate.toISOString(),
        sessionDurationInDays,
        creatorRefreshToken,
        active
      ],
      client
    );

    return result.rows[0];
}

export async function deactivateAllSalesSessions(client){
    const result = await query(
        `UPDATE sales_sessions SET is_active = false WHERE is_active = true
         RETURNING ${returnColumns}`,
        [],
        client
      );
    return result.rows;
}

export async function getMostRecentActiveSalesSession(client){
    const sql =
      `SELECT ${returnColumns} FROM sales_sessions WHERE is_active = true ORDER BY end_date DESC LIMIT 1`;
    const result = await query(sql, [], client);
    return result.rows[0];
}