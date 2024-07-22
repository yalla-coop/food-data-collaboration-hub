
import { recordOrderLines, retrieveOrderLines } from './producerOrderLines.js'
import { query } from '../connect.js';
import { getClient } from '../connect.js';

describe('Producer Order Lines', () => {

    let client = null;

    beforeAll(async () => {
        client = await getClient();
    })

    afterAll(async () => {
        client.release();
    })

    beforeEach(async () => {
        await query(`truncate table producer_order_lines restart identity`, [], client);
    });

    const orderLines = [
        {
            producerOrderLineId: '1001',
            producerProductId: '9001',
            quantity: 5,
        },
        {
            producerOrderLineId: '1002',
            producerProductId: '9002',
            quantity: 10,
        }
    ];

    it('Can be recorded and retrieved', async () => {

        await recordOrderLines(1, orderLines, client);

        const retrievedLines = await retrieveOrderLines(1);

        expect(retrievedLines).toStrictEqual(orderLines);
    });

    it('Can be updated', async () => {
        await recordOrderLines(1, orderLines, client);

        const updatedLines = [
            {
                producerOrderLineId: '1001',
                producerProductId: '9001',
                quantity: 7,
            },
            {
                producerOrderLineId: '1002',
                producerProductId: '9002',
                quantity: 12,
            },
            {
                producerOrderLineId: '1003',
                producerProductId: '9003',
                quantity: 14,
            }
        ];

        await recordOrderLines(1, updatedLines, client)

        const retrievedLines = await retrieveOrderLines(1);

        expect(retrievedLines).toStrictEqual(updatedLines);
    });
})