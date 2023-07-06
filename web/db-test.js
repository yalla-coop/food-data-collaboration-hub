import sqlite3 from 'sqlite3';
import path from 'path';

const isTestEnv = process.env.NODE_ENV === 'test';

const DEFAULT_DB_FILE = isTestEnv
  ? path.join(process.cwd(), '/web/test-database.sqlite')
  : path.join(process.cwd(), 'database.sqlite');

export const DB = {
  shopifySessionsTable: 'shopify_sessions',
  db: null,
  ready: null,

  init: async function () {
    /* Initializes the connection to the database */
    this.db = this.db ?? new sqlite3.Database(DEFAULT_DB_FILE);
    this.ready = Promise.resolve();
  },
  read: async function (id) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.shopifySessionsTable}
      WHERE id = ?;
    `;
    const rows = await this.__query(query, [id]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;

    return rows[0];
  },

  delete: async function (id) {
    await this.ready;
    const query = `
      DELETE FROM ${this.shopifySessionsTable}
      WHERE id = ?;
    `;

    return this.__query(query, [id]);
  },

  deleteAll: async function () {
    await this.ready;
    const query = `
      DELETE FROM ${this.shopifySessionsTable};
    `;

    return this.__query(query);
  },

  write: async function ({
    id,
    accessToken,
    scope,
    expires,
    shop,
    state,
    isOnline = false
  }) {
    await this.ready;
    const query = `
      INSERT INTO ${this.shopifySessionsTable} (id, accessToken, scope, expires, shop, state, isOnline)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const params = [id, accessToken, scope, expires, shop, state, isOnline];

    return this.__query(query, params);
  },

  /* Perform a query on the database. Used by the various CRUD methods. */
  __query: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }
};