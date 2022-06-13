const db = require('../db/index');
const Model = require('../db/Model');
const USER_ROOM_COLUMNS = [
  'room_id',
  'member',
  'room_name',
  'avatar',
  'created_at',
  'modified_at',
];

class Room extends Model {
  /**
   * @param { PoolClient } client
   */
  constructor(client) {
    super(client, 'public.room_users');
  }

  /**
   * @returns { Promise<Room> } створення екземпляру класу Room
   */
  static async createModel() {
    try {
      const client = await db.getClient();
      return new Room(client);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Room createModel';
        console.log(error);
      }
      throw error;
    }
  }

  /** Пошук кімнат в БД
   * @param { {key: value} } params
   * @returns {Promise<[{room_id : string, member: number, room_name: string,
   * avatar: string, created_at:Date, modified_at:Date}]>} перелік кімнат
   */
  async findRooms(params) {
    console.log('Room findRooms');
    try {
      const rooms = await this.find(USER_ROOM_COLUMNS, params);
      return rooms;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Room findRooms';
        console.log(error);
      }
      throw error;
    }
  }

  /** перелік кімнат, в яких зареєстрований користувач
   * @param { number } userId
   * @returns Promise<[{room_id : string, member: number, room_name: string,
   * avatar: string, created_at:Date, modified_at:Date}]>} перелік кімнат
   */
  async findUserRooms(userId) {
    console.log('Room findUserRooms');
    try {
      const rooms = await this.findRooms({ member: userId });
      return rooms;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Room findUserRooms';
        console.log(error);
      }
      throw error;
    }
  }

  /**
   * @param { [{id : number, name: string}] } members id учасника кімнати,
   *   назва кімнат для кожного учасника
   * @param { number } roomState стан кімнати, що створюються
   *  0-доступна,
   *  1-заблокована
   * @param { number } roomType тип кімнати
   *   0 - чат двох користувачів,
   *   1 - група користувачів,
   *   2 - інформаційний канал
   * @returns { Promise<string> } створена кімната
   */
  async newRoom(members, roomState = 0, roomType = 0) {
    try {
      if (members.length === 0) {
        console.log('Відсутні підписники для нової кімнати.');
        return {};
      }

      await this.client.query('BEGIN');
      const sql =
        'INSERT INTO public.rooms ( state, room_type )' +
        ' VALUES ($1, $2)' +
        ' RETURNING id';
      const { rows } = await this.query(sql, [roomState, roomType]);
      if (rows.length === 0) {
        throw new Error('Запис в таблиці public.rooms не створений.');
      }
      const roomId = rows[0].id;
      members.forEach(async (member) => {
        await this.insert({
          // eslint-disable-next-line camelcase
          room_id: roomId,
          member: member.id,
          // eslint-disable-next-line camelcase
          room_name: member.name,
          avatar: member.avatar,
        });
      });
      await this.client.query('COMMIT');
      return roomId;
    } catch (error) {
      await this.client.query('ROLLBACK');
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Room newRoom';
        console.log(error);
      }
      throw error;
    }
  }
}
module.exports = Room;
