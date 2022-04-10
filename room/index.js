'use strict';
const RoomService = require('./Room.Service');

/**
 *
 * @param { number } userId
 * @returns
 */
async function getUserRooms(userId) {
  let roomService;
  try {
    roomService = await RoomService.createRoomService();
    const rooms = await roomService.findUserRooms(userId);
    return rooms;
  } catch (error) {
    console.dir(error);
    return [];
  } finally {
    if (roomService) {
      roomService.release();
    }
  }
}

/**
 *
 * @param { number } memberId
 * @param { {} } owner
 * @returns {Promise<[{room_id : string, member: number, room_name: string,
 * created_at:Date, modified_at:Date}] | []>}
 */
async function createPrivateChat(memberId, owner) {
  let roomService;
  try {
    roomService = await RoomService.createRoomService();
    const sql = `select 
        id, login, user_name, state, created_at, modified_at 
      from public.users
      where id = $1`;

    const { rows } = await roomService.model.query(sql, [memberId]);
    if (rows.length === 0) {
      throw new Error(`Користувач з id = ${memberId} не знайдено!`);
    }
    const user = rows[0];
    const member = { id: user.id, name: owner.user_name };
    const members = [member, { id: owner.id, name: user.user_name }];
    const roomId = await roomService.newRoom(members, 0, 0);
    const rooms = await roomService.findUserRoomsById(roomId);
    return rooms;
  } catch (error) {
    console.dir(error);
    return [];
  } finally {
    if (roomService) {
      roomService.release();
    }
  }
}

module.exports = { getUserRooms, createPrivateChat };
