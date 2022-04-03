'use strict';
const db = require('../db/index');
const Model = require('../db/Model');

class Room extends Model {
  /**
   *
   * @param { PoolClient } client
   */
  constructor(client) {
    super(client, 'public.room_users');
  }

  /**
   * @returns { Promise<Room> } створення екземпляру класа Room
   */
  static async createRoom() {
    const client = await db.getClient();
    return new Room(client);
  }

  /** Пошук кімнат в БД
   * @param { {key: value} } params
   * @returns {Promise<[{room_id : string, member: number, room_name: string,
   * created_at:Date, modified_at:Date}]>} перелік кімнат
   */
  async findRooms(params) {
    try {
      const rooms = await this.find(
        ['room_id', 'member', 'room_name', 'created_at', 'modified_at'],
        params
      );
      return rooms;
    } catch (error) {
      console.dir(error);
      return [];
    }
  }

  /** перелік кімнат, в яких зареєстрований користувач
   * @param { number } userId
   * @returns Promise<[{room_id : string, member: number, room_name: string,
   * created_at:Date, modified_at:Date}]>} перелік кімнат
   */
  async findUserRooms(userId) {
    const rooms = await this.findRooms({ member: userId });
    return rooms;
  }

  /**
   * @param { [{id : number, name: string}] } members id учасника кімнати, назва кімнат для кожного учасника
   * @param { number } roomState стан кімнати, що створюються 0-доступна 1-заблокована
   * @param { number } roomType тип кімнати 0-чат 2 користувачів, 1-група користувачів, 2 - інформаційний канал
   * @returns { Promise<string> } створена кімната
   */
  async newRoom(members, roomState = 0, roomType = 0) {
    console.log('Room newRoom');
    try {
      // створити запис в таблиці rooms
      // створити записи в таблиці room_users - модель
      if (members.length === 0) {
        console.log('Відсутні підписники для нової кімнати.');
        return {};
      }

      await this.client.query('BEGIN');
      const sql =
        'INSERT INTO public.rooms ( state, room_type )' +
        ' VALUES ($1, $2)' +
        ' RETURNING id';
      console.dir({ roomState, roomType, sql });
      const { rows } = await this.query(sql, [roomState, roomType]);
      if (rows.length === 0) {
        throw new Error('Помилка створення запису в таблиці public.rooms');
      }
      const roomId = rows[0].id;
      members.forEach(async (member) => {
        console.dir({ roomId, member });
        await this.insert({
          room_id: roomId,
          member: member.id,
          room_name: member.name,
        });
      });
      await this.client.query('COMMIT');
      return roomId;
    } catch (error) {
      console.log(error);
      await this.client.query('ROLLBACK');
      return undefined;
    }
  }
}
module.exports = Room;
