'use strict';
const db = require('./index');

/**
 * @description основні операції з БД з конкретним з'єднаннам з Pool та таблицею
 * @property { PoolClient } client
 * @property { String } table
 */
class Model {
  /**
   * @param { PoolClient } client
   * @param { String } table
   */
  constructor(client, table) {
    this.table = table;
    this.client = client;
  }

  /** звільняє клієнта в пул */
  release() {
    this.client.release();
  }

  /**
   * @param { String } table таблиця в БД, з якою пов'язана модель
   * @returns повертає екземпляр моделі для роботи х таблицею БД
   */
  // static async createModel(table) {
  //   const client = await db.getClient();
  //   return new Model(client, table);
  // }

  /**
   * @param { [ String ] } columns перелік стовбців в select
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
      console.dir({ sql, params });
      const { rows } = await this.client.query(sql, whereValues);
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

  /**
   * @param { [ String ] } columns перелік стовбців в select
   * @param { { key: value } } params параметри пошуку key = value
   * @returns { Promise< object|{} > } повертає 1 рядок результату select
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

  /**
   * @param { { key: value } } params параметри пошуку key = value
   * @returns { Promise< number > } Повертає кількість рядків, які були видалені
   */
  async delete(params) {
    try {
      const whereColumns = Object.keys(params);
      const whereValues = Object.values(params);
      const sql = `DELETE FROM ${this.table}
        WHERE ${whereColumns
          .map((c, i) => c + ' = $' + (i + 1))
          .join(' AND ')}`;
      const { rowCount } = await this.client.query(sql, whereValues);
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

  /**
   * @param { { key: value } } columns - колонки таблиці та їх значення
   * @param { [ string ] } returning - перелік колонок, які повертаються користувачу
   * @returns { Promise<object> } повертає результат операції insert в БД
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
      const { rows } = await this.client.query(sql, values);
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
   * @param { string } sql текст запиту
   * @param { [*] } params параметри запиту
   * @returns { Promise<pg.Result> } результат виконання запиту
   */
  async query(sql, params) {
    try {
      const result = await this.client.query(sql, params);
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
