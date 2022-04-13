'use strict';
require('dotenv').config();
const db = require('../db/index');
const Model = require('../db/Model');
const bcrypt = require('bcrypt');
//const secretConfig = require('../config/secret.config');
const SALT = process.env.SALT;
class User extends Model {
  /**
   *
   * @param { PoolClient } client
   */
  constructor(client) {
    super(client, 'public.users');
  }

  static async createUser() {
    const client = await db.getClient();
    return new User(client);
  }

  /** користувач за його логіном
   * @param { {key: value} } params
   * @returns {Promise<{id : number, login: string, user_name: string,
   * state: number, created_at:Date, modified_at:Date}>
   * } користувач за його логіном або {}
   */
  async findUser(params) {
    try {
      const user = await this.findOne(
        ['id', 'login', 'user_name', 'state', 'created_at', 'modified_at'],
        params
      );
      return user;
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  /** користувач за його id
   * @param { number } userId
   * @returns {Promise<{id : number, login: string, user_name: string,
   * state: number, created_at:Date, modified_at:Date}>
   * } користувач за його id або {}
   */
  async getUserById(userId) {
    try {
      const user = await this.findOne(
        ['id', 'login', 'user_name', 'state', 'created_at', 'modified_at'],
        { id: userId }
      );
      return user;
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  /** повертає результат порівняння переданого пароля з тим, що кешований в БД
   * @param { number } userId - ідентифікатор користувача,
   *  для якого перевіряється пароль
   * @param { string } verifiedPassword - пароль для перевірки
   * @returns { Promise<boolean> } проміс,
   * який буде вирішений як результат порівняння * із збереженим в БД паролем
   */
  async verifyPassword(userId, verifiedPassword) {
    try {
      const { password } = await this.findOne(['password'], { id: userId });
      if (!password)
        throw new Error(`Користувач з id ${userId} не знайдено в БД.`);
      return await bcrypt.compare(verifiedPassword, password);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async newUser(login, password, username) {
    const minLength = 6;
    try {
      if (login.length < minLength) {
        throw new Error(
          `Довжина поля login повинна бути не менше ${minLength} символів.`
        );
      }
      if (password.length < minLength) {
        throw new Error(
          `Довжина поля password повинна бути не менше ${minLength} символів.`
        );
      }
      if (username.length < minLength) {
        throw new Error(
          `Довжина поля username повинна бути не менше ${minLength} символів.`
        );
      }
      const hashPassword = await bcrypt.hash(password, SALT);

      const user = await this.insert(
        // eslint-disable-next-line camelcase
        { login, password: hashPassword, user_name: username },
        ['id', 'login', 'user_name', 'state', 'created_at', 'modified_at']
      );
      return user;
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  /**
   * повертає перелік користувачів, з якими у користувача userId відсутні чати(кімнати)
   * @param { number } userId
   * @returns { Promise<[{id : number, login: string, user_name: string,
   * state: number, created_at:Date, modified_at:Date}]> }
   */
  async getContacts(userId) {
    try {
      const sql = `select id, login, user_name, state, created_at, modified_at
        from public.contacts
        where "owner" = $1`;
      const { rows } = await this.query(sql, [userId]);
      return rows;
    } catch (error) {
      console.dir(error);
      return [];
    }
  }
}
module.exports = User;
