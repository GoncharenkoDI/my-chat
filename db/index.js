'use strict';
require('dotenv').config();
const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString, sslmode: 'disable' });
console.log('create new Pool');
module.exports = {
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
