'use strict';
const RoomService = require('./Room.Service');

/** Перелік кімнат, в яких зареєстрований користувач
 * @param { number } userId
 * @returns
 */
async function getUserRooms(userId) {
  console.log('index getUserRooms');
  let roomService;
  try {
    roomService = await RoomService.createService();
    const rooms = await roomService.findUserRooms(userId);
    return rooms;
  } catch (error) {
    if (!error.type) {
      error.type = 'server error';
    }
    if (!error.source) {
      error.source = 'room index getUserRooms';
      console.log(error);
    }
    throw error;
  } finally {
    if (roomService) {
      roomService.release();
    }
  }
}

/** Створення чата для двох користувачів
 * @param { number } memberId
 * @param { {id : number, login: string, user_name: string,
 * avatar: string; state: number, created_at:Date, modified_at:Date} } owner
 * @returns {Promise<[{room_id : string, member: number, room_name: string,
 * avatar: string, created_at:Date, modified_at:Date}] | []>}
 */
async function createPrivateChat(memberId, owner) {
  let roomService;
  try {
    roomService = await RoomService.createService();
    const sql = `select
        id, login, user_name, avatar, state, created_at, modified_at
      from public.users
      where id = $1`;

    const { rows } = await roomService.model.query(sql, [memberId]);
    if (rows.length === 0) {
      const error = new Error(`Користувач з id = ${memberId} не знайдено!`);
      error.type = 'params error';
      throw error;
    }
    const user = rows[0];
    const member = { id: user.id, name: owner.user_name, avatar: owner.avatar };
    const members = [
      member,
      { id: owner.id, name: user.user_name, avatar: user.avatar },
    ];
    const roomId = await roomService.newRoom(members, 0, 0);
    const rooms = await roomService.findUserRoomsById(roomId);
    return rooms;
  } catch (error) {
    if (!error.type) {
      error.type = 'server error';
    }
    if (!error.source) {
      error.source = 'room index createPrivateChat';
      console.log(error);
    }
    throw error;
  } finally {
    if (roomService) {
      roomService.release();
    }
  }
}

module.exports = { getUserRooms, createPrivateChat };
