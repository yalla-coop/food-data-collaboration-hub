import { query, pool } from '../connect.js';

export async function recordOrderLines(salesSessionId, orderLines, client) {
    const parameters = orderLines.map(line => ({ ...line, salesSessionId }));

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

export async function retrieveOrderLines(salesSessionId) {
    return (await pool.query(`SELECT producer_order_line_id as "producerOrderLineId", producer_product_id as "producerProductId", quantity FROM producer_order_lines where sales_session_id = $1`, [salesSessionId])).rows;
}