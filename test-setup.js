import { pool } from "./web/database/connect";

process.env.PRODUCER_SHOP_URL = 'http://madeupproducer.com/';
process.env.PRODUCER_SHOP = 'made-up-shop';

afterAll(async () => {
    await pool.end();
});