'use strict';
const Room = require('./Room');
/** клас для роботи з екземпляром класу
 * @class
 * @public { Room } model
 */
class RoomService {
  /** конструктор для створення екземпляру RoomService
   * @param { Room } model
   */
  constructor(model) {
    /**@type { Room } */ this.model = model;
  }

  /** асинхронна функція для створення екземпляру RoomService
   * @returns { RoomService }
   */
  static async createService() {
    try {
      const model = await Room.createModel();
      return new RoomService(model);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Room.Service createService';
        console.log(error);
      }
      throw error;
    }
  }

  /** знаходить в БД кімнати, в яких зареєстрований користувач
   * @param { number } userId
   * @returns { Promise<[{room_id : string, member: number, room_name: string,
   * avatar: string, created_at:Date, modified_at:Date}]> } - повертає перелік користувача
   */
  async findUserRooms(userId) {
    console.log('Room.Service findUserRooms');
    try {
      const rooms = await this.model.findUserRooms(userId);
      return rooms;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Room.Service findUserRooms';
        console.log(error);
      }
      throw error;
    }
  }

  /** Вибір користувачів кімнати з id = roomId
   * @param { string } roomId
   * @returns {Promise<[{room_id : string, member: number, room_name: string,
   * avatar: string, created_at:Date, modified_at:Date}]>}
   */
  async findUserRoomsById(roomId) {
    try {
      // eslint-disable-next-line camelcase
      const rooms = await this.model.findRooms({ room_id: roomId });
      return rooms;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Room.Service findUserRoomsById';
        console.log(error);
      }
      throw error;
    }
  }

  /** Створення чата для двох користувачів
   * @param {[{id : number, name: string}]} members
   * @param { number } roomState
   * @param { number } roomType
   * @returns { Promise<string> } створена кімната
   */
  async newRoom(members, roomState = 0, roomType = 0) {
    try {
      const roomId = await this.model.newRoom(members, roomState, roomType);
      if (!roomId) {
        const error = new Error('Помилка створення кімнати для спілкування');
        if (!error.type) {
          error.type = 'server error';
        }
        throw error;
      }
      return roomId;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Room.Service newRoom';
        console.log(error);
      }
      throw error;
    }
  }

  release() {
    this.model.release();
  }
}

module.exports = RoomService;
