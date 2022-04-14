'use strict';
require('dotenv').config();
const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;
let pool;
try {
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} catch (error) {
  console.log(error);
  throw error;
}

console.log('create new Pool');
module.exports = {
  getPool() {
    return pool;
  },
  /** повертає результат виконання sql
   * @param {String} sql
   * @param {Array} params
   * @returns { Promise<any> }
   */
  async query(sql, params) {
    const result = await pool.query(sql, params);
    return result;
  },

  /** повертає нового клієнта з пула
   * @returns { Promise<PoolClient>}
   */
  async getClient() {
    const client = await pool.connect();
    return client;
  },

  /**
   * @param { PoolClient } client
   * @param { String } sql
   * @param {Array} params
   * @returns  { Promise<any> } повертає результат виконання sql
   */
  async clientQuery(client, sql, params) {
    const result = await client.query(sql, params);
    return result;
  },
};
