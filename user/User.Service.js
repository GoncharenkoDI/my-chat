'use strict';
const User = require('./User');

class UserService {
  /**
   * @param { User } model
   */
  constructor(model) {
    this.model = model;
  }

  static async createService() {
    const model = await User.createModel();
    return new UserService(model);
  }

  /** знаходить в БД користувача за його логіном та паролем
   * @param { string } loginName
   * @param { string } password
   * @returns { Promise<{id : number, login: string, user_name: string,
   * state: number, created_at:Date, modified_at:Date} | false> } -
   *  повертає користувача, якщо він в БД
   * та пароль правильний
   */
  async checkUser(loginName, password) {
    try {
      const user = await this.model.findUser({
        login: loginName.toLowerCase(),
        state: 0,
      });
      if (Object.keys(user).length === 0) return false;
      const isVerified = await this.model.verifyPassword(user.id, password);
      if (isVerified) return user;
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /** Користувач за його id
   *
   * @param { number } userId
   * @returns { Promise<{id : number, login: string, user_name: string,
   * state: number, created_at:Date, modified_at:Date}> Користувач
   */
  async getUser(userId) {
    return await this.model.getUserById(userId);
  }

  async createUser(login, username, password) {
    try {
      const candidate = await this.model.findUser({
        login: login.toLowerCase(),
      });
      if (Object.keys(candidate).length !== 0) return false;
      const user = await this.model.newUser(
        login.toLowerCase(),
        password,
        username
      );
      if (Object.keys(user).length === 0) return false;
      return user;
    } catch (error) {
      if (!error.type) {
        error.type = 'check params';
      }
      if (!error.source) {
        error.source = 'User.Service createUser';
      }
      console.log(error);
      return false;
    }
  }

  /**
   * повертає перелік користувачів, з якими у користувача userId
   * відсутні чати(кімнати)
   * @param { number } userId
   * @returns { Promise<[{id : number, login: string, user_name: string,
   * state: number, created_at:Date, modified_at:Date}]> }
   */
  async getContacts(userId) {
    try {
      const contacts = await this.model.getContacts(userId);
      return contacts;
    } catch (error) {
      console.dir(error);
      return [];
    }
  }

  release() {
    this.model.release();
  }
}

module.exports = UserService;
