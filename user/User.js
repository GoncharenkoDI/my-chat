require('dotenv').config();
const db = require('../db/index');
const Model = require('../db/Model');
const bcrypt = require('bcrypt');
const SALT = +process.env.SALT;
const USER_COLUMNS_SET = [
  'id',
  'login',
  'user_name',
  'avatar',
  'state',
  'created_at',
  'modified_at',
];
const DEFAULT_AVATAR = 'avatar-icon-116137-1938.png';
class User extends Model {
  constructor(client) {
    super(client, 'public.users');
  }

  static async createModel() {
    try {
      const client = await db.getClient();
      return new User(client);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'User createModel';
        console.log(error);
      }
      throw error;
    }
  }

  /** користувач за його логіном
   * @param { {key: value} } params
   * @returns {Promise<{id : number, login: string, user_name: string,
   * avatar: string, state: number, created_at:Date, modified_at:Date}>
   * } користувач за його логіном
   */
  async findUser(params) {
    try {
      const user = await this.findOne(USER_COLUMNS_SET, params);
      return user;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'User findUser';
        console.log(error);
      }
      throw error;
    }
  }

  /** користувач за його id
   * @param { number } userId
   * @returns {Promise<{id : number, login: string, user_name: string,
   * avatar: string, state: number, created_at:Date, modified_at:Date}>
   * } користувач за його id або {}
   */
  async getUserById(userId) {
    try {
      const user = await this.findOne(USER_COLUMNS_SET, {
        id: userId,
        state: 0,
      });
      return user;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'User getUserById';
        console.log(error);
      }
      throw error;
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
      const { password } = await this.findOne(['password'], {
        id: userId,
        state: 0,
      });
      if (!password) {
        const error = new Error(`Користувач з id ${userId} не знайдено в БД.`);
        error.type = 'auth error';
        throw error;
      }
      return await bcrypt.compare(verifiedPassword, password);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'User verifyPassword';
        console.log(error);
      }
      throw error;
    }
  }

  /** створює нового користувача в БД
   * @param { string } login
   * @param { string } password
   * @param { string } username
   * @returns { {id : number, login: string, user_name: string,
   * avatar: string, state: number, created_at:Date, modified_at:Date} }
   */
  async newUser(login, password, username) {
    const minLength = 6;
    try {
      if (
        login.length < minLength ||
        password.length < minLength ||
        username.length < 1
      ) {
        const error = new Error('');
        error.type = 'check params';
        if (login.length < minLength) {
          error.message = `Пароль повинен бути не менше ${minLength} символів.`;
          throw error;
        }
        if (password.length < minLength) {
          error.message = `Пароль повинен бути не менше ${minLength}
          символів.`;
          throw error;
        }
        if (username.length < 1) {
          // eslint-disable-next-line quotes
          error.message = `Ім'я користувача повинно бути заповнене.`;
          throw error;
        }
      }
      const hashPassword = await bcrypt.hash(password, SALT);
      /**@type { {id : number, login: string, user_name: string,
       * avatar: string, state: number, created_at:Date, modified_at:Date} } */
      const user = await this.insert(
        // eslint-disable-next-line camelcase
        {
          login,
          password: hashPassword,
          // eslint-disable-next-line camelcase
          user_name: username,
          state: 0,
          avatar: DEFAULT_AVATAR,
        },
        USER_COLUMNS_SET
      );
      return user;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'User newUser';
        console.log(error);
      }
      throw error;
    }
  }

  /** повертає перелік користувачів,
   * з якими у користувача userId відсутні чати(кімнати)
   * @param { number } userId
   * @returns { Promise<[{id : number, login: string, user_name: string,
   * avatar: string, state: number, created_at:Date, modified_at:Date}]> }
   */
  async getContacts(userId) {
    try {
      const sql = `select  ${USER_COLUMNS_SET.join(',')}
        from public.contacts
        where "owner" = $1`;
      const { rows } = await this.query(sql, [userId]);
      return rows;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'User getContacts';
        console.log(error);
      }
      throw error;
    }
  }

  /** Повертає кількість змінених рядків в таблиці public.users
   * повинно бути 1
   * @param { number} userId
   * @param {{ key: value }} updateData
   * @returns { Promise<number>}
   */
  async updateUser(userId, updateData) {
    try {
      await this.client.query('BEGIN');
      const rowCount = await this.update(updateData, { id: userId });
      const roomUserData = {};
      if (updateData['avatar']) roomUserData['avatar'] = updateData['avatar'];
      if (updateData['user_name']) {
        roomUserData['room_name'] = updateData['user_name'];
      }
      if (Object.keys(roomUserData).length !== 0) {
        const roomUserSet = Object.keys(roomUserData).map(
          (c, i) => c + ' = $' + (i + 1)
        );
        const romUserValue = Object.values(roomUserData);
        const sql = `update public.room_users set ${roomUserSet.join()}
          where id in (
            select member_ru_id from  public.room_members
            where owner = $${roomUserSet.length + 1}
          )`;
        await this.query(sql, [...romUserValue, userId]);
      }
      await this.client.query('COMMIT');
      return rowCount;
    } catch (error) {
      await this.client.query('ROLLBACK');
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'User updateUser';
        console.log(error);
      }
      throw error;
    }
  }
}
module.exports = User;
