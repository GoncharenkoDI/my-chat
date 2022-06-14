const db = require('../db/index');
const Model = require('../db/Model');

class Message extends Model {
  /**
   * @param { PoolClient } client
   */
  constructor(client) {
    super(client, 'public.messages');
  }

  static async createModel() {
    try {
      const client = await db.getClient();
      return new Message(client);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Message createModel';
        console.log(error);
      }
      throw error;
    }
  }

  /** Повідомлення, зареєстровані в кімнаті roomId
   * @param { string } roomId
   * @returns { Promise<[{
   *   id : number,
   *   destination: string,
   *   author: number,
   *   user_name: string,
   *   text: string,
   *   created_at:Date,
   *   modified_at:Date}]> }
   */
  async getMessagesInRoom(roomId) {
    try {
      const sql = `select
        m.id, m.destination, m.author, u.user_name, m.text, m.created_at,
        m.modified_at
      from
        public.messages m
        inner join public.users u on m.author = u.id
      where destination = $1
      order by m.created_at`;
      const { rows } = await this.query(sql, [roomId]);
      return rows;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Message getMessagesInRoom';
        console.log(error);
      }
      throw error;
    }
  }

  /** Додає повідомлення до БД
   * @param { {author: number, destination: string, text: string} } message
   * @returns { Promise<{
   *     id : number,
   *     destination: string,
   *     author: number,
   *     text: string,
   *     created_at:Date,
   *     modified_at:Date} > }
   */
  async addMessage(message) {
    try {
      const newMessage = await this.insert(message, [
        'id',
        'destination',
        'author',
        'text',
        'created_at',
        'modified_at',
      ]);
      return newMessage;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Message addMessage';
        console.log(error);
      }
      throw error;
    }
  }
}
module.exports = Message;
