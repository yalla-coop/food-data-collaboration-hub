import { readSqlFile } from './connect.js';

const buildProductTable = async () => {
  try {
    await Promise.all([
      readSqlFile(process.cwd() + '/web/database/auto-timestamp.sql'),
      readSqlFile(process.cwd() + '/web/database/products/schema.sql'),
      readSqlFile(process.cwd() + '/web/database/sales-sessions/schema.sql'),
      readSqlFile(process.cwd() + '/web/database/webhooks/schema.sql'),
      readSqlFile(process.cwd() + '/web/database/variants/schema.sql')
    ]);
  } catch (err) {
    throw new Error(err);
  }
};

buildProductTable();
