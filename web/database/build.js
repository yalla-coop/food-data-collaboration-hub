import { readSqlFile } from './connect.js';

const buildProductTable = async () => {
  try {
    await readSqlFile(process.cwd() + '/web/database/auto-timestamp.sql');
    await readSqlFile(
      process.cwd() + '/web/database/sales-sessions-orders/schema.sql'
    );
    await readSqlFile(process.cwd() + '/web/database/products/schema.sql');
    await readSqlFile(
      process.cwd() + '/web/database/sales-sessions/schema.sql'
    );
    await readSqlFile(process.cwd() + '/web/database/webhooks/schema.sql');
    await readSqlFile(process.cwd() + '/web/database/variants/schema.sql');
    await readSqlFile(process.cwd() + '/web/database/producer-order-lines/schema.sql');
    await readSqlFile(process.cwd() + '/web/database/users/schema.sql');
  } catch (err) {
    throw new Error(err);
  }
};

buildProductTable();
