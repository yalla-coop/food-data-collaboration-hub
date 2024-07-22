import { query, pool, getClient } from '../connect.js';

export async function recordOrderLines(salesSessionId, orderLines) {
    const parameters = orderLines.map(line => ({ ...line, salesSessionId }));

    const client = await getClient();

    try {
        await client.query('BEGIN')

        await forget(salesSessionId, client);
        await insert(parameters, client);

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    };


}

async function insert(parameters, client) {
    const sql =
        `INSERT INTO producer_order_lines (sales_session_id, producer_order_line_id, producer_product_id, quantity)
(SELECT *
FROM json_to_recordset($1)
AS x("salesSessionId" bigint, "producerOrderLineId" bigint, "producerProductId" bigint, "quantity" INTEGER))
RETURNING id`;

    const result = await query(
        sql,
        [JSON.stringify(parameters)],
        client
    );

    return result.rows[0];
}

async function forget(salesSessionId, client) {
    await query(`delete from producer_order_lines where sales_session_id = $1`, [salesSessionId], client);
}

export async function retrieveOrderLines(salesSessionId) {
    return (await pool.query(`SELECT producer_order_line_id as "producerOrderLineId", producer_product_id as "producerProductId", quantity FROM producer_order_lines where sales_session_id = $1`, [salesSessionId])).rows;
}