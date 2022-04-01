'use strict';
const Room = require('./Room');

class RoomService {
  /**
   * @param { Room } model
   */
  constructor(model) {
    this.model = model;
  }

  static async createRoomService() {
    const model = await Room.createRoom();
    return new RoomService(model);
  }

  /** знаходит в БД кімнати, в яких зареєстрований користувач
   * @param { number } userId
   * @returns { Promise<[{room_id : string, member: number, room_name: string,
   * created_at:Date, modified_at:Date}]> } - повертає перелік користувача
   */
  async findUserRooms(userId) {
    try {
      const rooms = await this.model.findUserRooms(userId);
      return rooms;
    } catch (error) {
      console.dir(error);
      return [];
    }
  }

  /**
   *
   * @param { string } roomId
   * @returns {Promise<[{room_id : string, member: number, room_name: string,
   * created_at:Date, modified_at:Date}]>}
   */
  async findUserRoomsById(roomId) {
    try {
      const rooms = await this.model.findRooms({ room_id: roomId });
      return rooms;
    } catch (error) {
      console.dir(error);
      return [];
    }
  }

  /**
   *
   * @param {[{id : number, name: string}]} members
   * @param { number } roomState
   * @param { number } roomType
   * @returns { Promise<string> } створена кімната
   */
  async newRoom(members, roomState = 0, roomType = 0) {
    try {
      const roomId = await this.model.newRoom(members, roomState, roomType);
      if (!roomId) {
        throw new Error('Помилка створення кімнати для спілкування');
      }
      return roomId;
    } catch (error) {
      console.dir(error);
      return undefined;
    }
  }

  release() {
    this.model.release();
  }
}

module.exports = RoomService;
