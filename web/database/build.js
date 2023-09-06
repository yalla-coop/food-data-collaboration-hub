import { readSqlFile, query } from './connect.js';

const buildProductTable = async () => {
  try {
    const sql = await readSqlFile(
      process.cwd() + '/web/database/products/schema.sql'
    );
  } catch (err) {
    throw new Error(err);
  }
};

buildProductTable();
