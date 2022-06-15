const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const { getUserRooms, createPrivateChat } = require('../room');
const { getMessagesInRoom, addMessage } = require('../message');
const { getContacts, updateUser, getUser } = require('../user');

const { PUBLIC_PATH = './client/dist' } = process.env;

function setHandlers(socket, user, activeUsers, io, activeSockets, activeRoom) {
  const onGetRooms = async (callback) => {
    try {
      const rooms = await getUserRooms(user.id);
      callback(rooms);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'index on get rooms handler';
        console.log(error);
      }
      socket.emit('server error', error);
      callback([]);
    }
  };
  const onNewChat = async (memberId) => {
    console.log(`new chat execute with memberId = ${memberId}`);
    try {
      const roomUsers = await createPrivateChat(memberId, user);
      if (roomUsers.length === 0) {
        throw new Error('Не вийшло створити новий чат');
      }
      const members = roomUsers.map((roomUser) => roomUser.member);
      for (const member of members) {
        const sendRoom = roomUsers.find((ru) => ru.member === member);
        const contacts = roomUsers
          .map((ru) => ru.member)
          .filter((m) => m !== member);
        if (activeUsers.has(member)) {
          const sockets = activeUsers.get(member);
          for (const s of sockets) {
            if (s === socket.id) {
              // ініціатор створення переходить в створену кімнату
              socket.emit('new chat', sendRoom, true, contacts[0]);
            } else {
              // просто додається в перелік кімнат
              io.in(s).emit('new chat', sendRoom, false, contacts[0]);
            }
          }
        }
      }
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'index on new chat';
        console.log(error);
      }
      socket.emit('server error', error);
    }
  };
  const onDisconnect = (reason) => {
    console.log(` З'єднання закрито sid ${socket.id} Причина - ${reason}.`);
    if (activeSockets.has(socket.id)) {
      const { user } = activeSockets.get(socket.id);
      activeSockets.delete(socket.id);

      if (activeUsers.has(user.id)) {
        let sockets = activeUsers.get(user.id);
        sockets = sockets.filter((s) => s !== socket.id);
        if (sockets.length === 0) {
          activeUsers.delete(user.id);
        } else {
          activeUsers.set(user.id, sockets);
        }
      }
    }
    console.dir({ activeSockets, activeUsers });
  };
  const onJoin = async (roomId, callback) => {
    try {
      /**
       * @type { Array }
       * @description socket.rooms - масив, в якому міститься
       * перелік всіх кімнат в яких зареєстрований цей сокет і id
       * цього сокета
       */
      const rooms = socket.rooms;
      /** виходимо зі всіх кімнат */
      rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
          console.log(
            `користувач з id = ${user.id} вийшов з кімнати з id = ${room}.`
          );
        }
      });
      socket.join(roomId);
      activeRoom = roomId;
      console.log(
        `користувач з id = ${user.id} ввійшов до кімнати з id = ${roomId}.`
      );
      const messages = await getMessagesInRoom(roomId);
      callback(messages, roomId);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'index on join';
        console.log(error);
      }
      socket.emit('server error', error);
    }
  };
  const onWhoAmI = async (callback) => {
    try {
      callback(user);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'index on who am i';
        console.log(error);
      }
      socket.emit('server error', error);
    }
  };
  const onContacts = async (userId) => {
    try {
      const contacts = await getContacts(userId);
      socket.emit('contacts', contacts);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'index on contacts';
        console.log(error);
      }
      socket.emit('server error', error);
    }
  };
  const onMessage = async (message) => {
    try {
      const newMessage = await addMessage(message);
      if (Object.keys(newMessage).length === 0) {
        const error = new Error('Не вдалось записати повідомлення.');
        throw error;
      }
      if (newMessage.author !== user.id) {
        const error = new Error(
          'Відправник не відповідає поточному користувачу.'
        );
        error.type = 'params error';
        throw error;
      }
      // eslint-disable-next-line camelcase
      newMessage.user_name = user.user_name;
      if (newMessage.destination !== activeRoom) {
        const error = new Error(
          'Призначення повідомлення не відповідає активній кімнаті.'
        );
        error.type = 'params error';
        throw error;
      }
      io.to(activeRoom).emit('message', newMessage);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'index on message';
        console.log(error);
      }
      socket.emit('server error', error);
    }
  };
  const onUpdateUser = async (data) => {
    try {
      const updateData = {
        // eslint-disable-next-line camelcase
        user_name: data.userName,
      };
      const userId = user.id;
      if (data.avatar) {
        const now = new Date().getTime();
        const avatarFileName = path.resolve(
          PUBLIC_PATH,
          'avatars',
          `u${userId}t${now}.png`
        );
        await fs.writeFile(avatarFileName, data.avatar);
        updateData['avatar'] = `u${userId}t${now}.png`;
      }
      await updateUser(user.id, updateData);
      user = await getUser(userId);
      socket.emit('user', user);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'index on update user';
        console.log(error);
      }
      socket.emit('server error', error);
    }
  };

  socket.on('get rooms', onGetRooms);
  socket.on('new chat', onNewChat);
  socket.on('disconnect', onDisconnect);
  socket.on('join', onJoin);
  socket.on('who am i', onWhoAmI);
  socket.on('contacts', onContacts);
  socket.on('message', onMessage);
  socket.on('update user', onUpdateUser);
}
module.exports = { setHandlers };
