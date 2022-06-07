'use strict';
const db = require('./index');

/**
 * @description основні операції з БД з конкретним з'єднанням з Pool та таблицею
 * @property { PoolClient } client
 * @property { String } table
 */
class Model {
  /**
   * @param { PoolClient } client
   * @param { String } table
   */
  constructor(client, table) {
    /**@type { string } */
    this.table = table;
    /**@type { PoolClient } */
    this.client = client;
  }

  /** звільняє клієнта в пул */
  release() {
    this.client.release();
  }

  /** Побудова та виконання звичайного select до таблиці this.table
   * @param { [ String ] } columns перелік колонок в select
   * @param { { key: value } } params параметри пошуку key = value
   * @param { [ String ] } orders порядком сортування orders
   * @returns { Promise< array | [] > } повертає результат виконання select
   */
  async find(columns, params, orders = []) {
    try {
      const whereColumns = Object.keys(params).map(
        (c, i) => c + ' = $' + (i + 1)
      );
      const whereValues = Object.values(params);
      const sql =
        `SELECT ${columns.join()} FROM ${this.table}` +
        ` WHERE ${whereColumns.join(' AND ')}` +
        `${orders.length !== 0 ? 'ORDER BY ' + orders.join() : ''}`;
      const { rows } = await db.clientQuery(this.client, sql, whereValues);
      return rows;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Model find';
        console.log(error);
      }
      throw error;
    }
  }

  /**повертає 1 рядок результату select
   * @param { [ String ] } columns перелік колонок в select
   * @param { { key: value } } params параметри пошуку key = value
   * @returns { Promise< object|{} > }
   */
  async findOne(columns, params) {
    try {
      const rows = await this.find(columns, params);
      if (rows.length === 0) return {};
      return rows[0];
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Model findOne';
        console.log(error);
      }
      throw error;
    }
  }

  /** видаляє рядки з таблиці
   * @param { { key: value } } params параметри пошуку key = value
   * @returns { Promise< number > } Повертає кількість рядків, які були видалені
   */
  async delete(params) {
    try {
      const whereColumns = Object.keys(params).map(
        (c, i) => c + ' = $' + (i + 1)
      );
      const whereValues = Object.values(params);
      const sql = `DELETE FROM ${this.table}
        WHERE ${whereColumns.join(' AND ')}`;
      const { rowCount } = await db.clientQuery(this.client, sql, whereValues);
      return rowCount;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Model delete';
        console.log(error);
      }
      throw error;
    }
  }

  /** повертає результат операції insert в БД
   * @param { { key: value } } columns - колонки таблиці та їх значення
   * @param { [ string ] } returning - перелік колонок,
   * які повертаються користувачу
   * @returns { Promise<object> }
   */
  async insert(columns, returning = []) {
    try {
      const columnsName = Object.keys(columns);
      const values = Object.values(columns);
      let sql =
        `INSERT INTO ${this.table} (${columnsName.join()})` +
        ` VALUES (${columnsName.map((c, i) => '$' + (i + 1)).join()})`;
      if (returning.length !== 0) {
        sql += ` RETURNING ${returning.join()}`;
      }
      const { rows } = await db.clientQuery(this.client, sql, values);
      return rows[0];
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Model insert';
        console.log(error);
      }
      throw error;
    }
  }

  /**
   *
   * @param { { key: value } } columns
   * @param { { key: value } } params
   * @returns
   */
  async update(columns, params) {
    try {
      const columnsName = Object.keys(columns).map(
        (c, i) => c + ' = $' + (i + 1)
      );
      const values = Object.values(columns);
      const columnsCount = columnsName.length;
      const whereColumns = Object.keys(params).map(
        (c, i) => c + ' = $' + (i + columnsCount + 1)
      );
      const whereValues = Object.values(params);
      const sql = `UPDATE ${this.table} SET ${columnsName.join()}
        WHERE ${whereColumns.join(' AND ')}`;
      const { rowCount } = await db.clientQuery(this.client, sql, values);
      return rowCount;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Model update';
        console.log(error);
      }
      throw error;
    }
  }
  /**
   *
   * @param { string } sql текст запиту
   * @param { [{ key: value }] } params параметри запиту
   * @returns { Promise<pg.Result> } результат виконання запиту
   */
  async query(sql, params) {
    try {
      const result = await db.clientQuery(this.client, sql, params);
      return result;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Model query';
        console.log(error);
      }
      throw error;
    }
  }
}

module.exports = Model;
