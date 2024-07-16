import { pool } from "./web/database/connect";

afterAll(async () => {
    await pool.end();
});