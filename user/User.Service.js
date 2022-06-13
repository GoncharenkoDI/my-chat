const User = require('./User');

class UserService {
  /**
   * @param { User } model
   */
  constructor(model) {
    /**@type { User } */
    this.model = model;
  }

  /**
   *
   * @returns { Promise<UserService> }
   */
  static async createService() {
    try {
      /**@type { User } */
      const model = await User.createModel();
      return new UserService(model);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'User.Service createService';
        console.log(error);
      }
      throw error;
    }
  }

  /** знаходить в БД користувача за його логіном та паролем
   * @param { string } loginName
   * @param { string } password
   * @returns { Promise<{id : number, login: string, user_name: string,
   *   avatar: string; state: number, created_at:Date,
   *   modified_at:Date} | false> }
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
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'User.Service checkUser';
        console.log(error);
      }
      throw error;
    }
  }

  /** Користувач за його id
   * @param { number } userId
   * @returns { Promise<{id : number, login: string, user_name: string,
   *   avatar: string, state: number, created_at:Date, modified_at:Date
   * }>
   */
  async getUser(userId) {
    try {
      return await this.model.getUserById(userId);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'User.Service getUser';
        console.log(error);
      }
      throw error;
    }
  }

  async createUser(login, username, password) {
    try {
      const candidate = await this.model.findUser({
        login: login.toLowerCase(),
      });
      if (Object.keys(candidate).length !== 0) {
        throw new Error('Користувач з вказаним логіном вже існує.');
      }
      const user = await this.model.newUser(
        login.toLowerCase(),
        password,
        username
      );
      if (Object.keys(user).length === 0) {
        return false;
      }
      return user;
    } catch (error) {
      if (!error.type) {
        error.type = 'check params';
      }
      if (!error.source) {
        error.source = 'User.Service createUser';
      }
      throw error;
    }
  }

  /** повертає перелік користувачів, з якими у користувача userId
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
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'User.Service getContacts';
      }
      throw error;
    }
  }

  /** Повертає кількість змінених рядків в таблиці public.users
   * повинно бути 1
   * @param { number} userId
   * @param {{ key: value }} updateData
   * @returns { Promise<boolean> }
   */
  async updateUser(userId, updateData) {
    try {
      const rowCount = await this.model.updateUser(userId, updateData);
      if (rowCount !== 1) {
        throw new Error('Помилка внесення змін в таблицю.');
      }
      return true;
    } catch (error) {
      if (!error.type) {
        error.type = 'check params';
      }
      if (!error.source) {
        error.source = 'User.Service updateUser';
      }
      throw error;
    }
  }
  release() {
    this.model.release();
  }
}

module.exports = UserService;
