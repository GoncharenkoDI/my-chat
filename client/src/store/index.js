import Vue from 'vue';
import Vuex from 'vuex';

import io from 'socket.io-client';

import http from './http';
import auth from './auth';
import {
  onRooms,
  onUser,
  onContacts,
  onMessage,
  onNewChat,
  onConnectError,
  onDisconnect,
  onServerError,
} from './eventHandlers.js';

Vue.use(Vuex);

//const ENDPOINT = 'http://localhost:5000/';
/**
 * тип для інформації про кімнату
 * @typedef {{room_id : string, member: number, room_name: string,
 * created_at:Date, modified_at:Date} | {}} roomType
 */
export default new Vuex.Store({
  state: {
    user: {},
    contact: {},
    roomUsers: [],
    /**
     * @type {{room_id : string, member: number, room_name: string,
     * created_at:Date, modified_at:Date} | {}}
     */
    room: {},
    rooms: [],
    socket: null,
    /** @type Array */
    messages: [],
    contacts: [],
    connectionError: null,
    alertShowTime: 0,
    alertMessages: [],
    alertId: 0,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setRoomUsers(state, users) {
      state.roomUsers = users;
    },
    setRoom(state, room) {
      state.room = room;
    },
    /** встановлює перелік кімнат
     * @param {*} state
     * @param { [{room_id : string, member: number, room_name: string,
     * created_at:Date, modified_at:Date}] } rooms
     */
    setRooms(state, rooms) {
      state.rooms = rooms;
    },
    /** додає нову кімнату до переліку
     * @param {*} state
     * @param {{room_id : string, member: number, room_name: string,
     * created_at:Date, modified_at:Date}} room
     */
    addRoom(state, room) {
      state.rooms.push(room);
    },
    updateRoom(state, room) {
      const rooms = state.rooms;
      const roomId = room.room_id;
      const index = rooms.findIndex((r) => r.room_id === roomId);
      if (index !== -1) {
        rooms[index] = room;
      }
    },
    /**
     * @param {*} state
     * @param { number } roomId
     */
    deleteRoom(state, roomId) {
      state.rooms.delete(roomId);
    },
    setSocket(state, socket) {
      state.socket = socket;
    },
    setMessages(state, messages) {
      state.messages = messages;
    },
    clearMessages(state) {
      state.messages = [];
    },
    addMessage(state, message) {
      state.messages.push(message);
    },
    updateMessage(state, message) {
      if (!message || !message.id) return;
      const id = message.id;
      /**@type Array */
      const messages = state.messages;
      const index = messages.findIndex((m) => m.id === id);
      if (index === -1) state.messages.push(message);
      else state.messages[index] = messages;
    },
    setConnectionError(state, error) {
      state.connectionError = error;
    },
    clearConnectionError(state) {
      state.connectionError = null;
    },
    setContacts(state, contacts) {
      state.contacts = contacts;
    },
    removeContact(state, contactId) {
      state.contacts = state.contacts.filter((c) => +c.id !== +contactId);
    },
    /**
     * @param {*} state
     * @param { {id: number, login: string, user_name: string, state: string,
     * created_at: Date, modified_at: Date * } } contact
     */
    setContact(state, contact) {
      state.contact = contact;
    },
    addAlertMessage(state, message) {
      console.log(' commit addAlertMessage ', JSON.stringify(message));
      state.alertMessages.push(message);
    },
    removeAlertMessage(state, messageId) {
      state.alertMessages = state.alertMessages.filter(
        (m) => m.id !== messageId
      );
    },
    incAlertId(state) {
      state.alertId++;
    },
  },
  getters: {
    hasRoom(state, roomId) {
      const rooms = state.rooms;
      const index = rooms.findIndex((r) => r.room_id === roomId);
      return index !== -1;
    },
    getRoom(state, roomId) {
      const rooms = state.rooms;
      const room = rooms.find((r) => r.room_id === roomId);
      return room;
    },
  },
  actions: {
    async newConnection({ state, commit }) {
      console.log('New connection');
      const socket = io(window.location.href, {
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log(`on connect. Ідентифікатор сокету - ${socket.id}`);
        if (socket.connected) {
          console.log('socket connected');
          socket.emit('who am i', async (user) => {
            console.log(`who am i відповідь ${JSON.stringify(user)}`);
            commit('setUser', user);
          });
          commit('setSocket', socket);
        } else {
          console.log('З`єднання НЕ встановлено');
          commit('setSocket', null);
        }
        socket.on('rooms', (rooms) => onRooms(rooms, commit));
        socket.on('user', (user) => onUser(user, commit));
        socket.on('contacts', (contacts) =>
          onContacts(contacts, state, commit)
        );
        socket.on('message', (message) => onMessage(message, commit));
        socket.on('new chat', (sendRoom, isOwner, contact) => {
          onNewChat(sendRoom, isOwner, contact, commit, state);
        });
      });

      socket.on('connect_error', async (error) =>
        onConnectError(error, socket, commit)
      );
      socket.on('disconnect', async (reason) => onDisconnect(reason, commit));
      socket.on('server error', (error) => onServerError(error));
    },
    changeRoom({ commit, state }, roomId) {
      console.log('change room', roomId);
      const socket = state.socket;
      if (!socket) {
        console.log('Відсутнє з`єднання1');
        return;
      }
      if (!socket.connected) {
        console.log('Відсутнє з`єднання2');
        return;
      }
      const room = state.rooms.find((r) => r.room_id === roomId);
      if (!room) {
        console.log(`Кімната ${roomId} відсутня в переліку`);
        return;
      }
      commit('setRoom', room);
      state.socket.emit('join', roomId, (messages, roomId) => {
        console.log(`join відповідь повідомлення - ${JSON.stringify(messages)},
        кімната - ${roomId}`);
        const room = state.rooms.find((r) => r.room_id === roomId);
        if (room) {
          commit('setRoom', room);
          commit('setMessages', messages);
        } else {
          console.log(`Кімната ${roomId} відсутня в переліку`);
          commit('setRoom', {});
          commit('setMessages', []);
        }
      });
    },
    sendMessage({ state }, text) {
      console.log(`sendMessage text: ${text}`);
      if (text.length === 0) {
        console.log('Текст повідомлення не може бути пустим');
        return;
      }
      const socket = state.socket;
      if (!socket) {
        console.log('Відсутнє з`єднання1');
        return;
      }
      if (!socket.connected) {
        console.log('Відсутнє з`єднання2');
        return;
      }
      const room = state.room;
      if (Object.keys(room).length === 0) {
        console.log('Ви не ввійшли до кімнати');
        return;
      }
      const user = state.user;
      if (Object.keys(user).length === 0) {
        console.log('Ви не ввійшли до програми');
        return;
      }
      socket.emit('message', {
        author: user.id,
        destination: room.room_id,
        text,
      });
    },
    setActiveContact({ commit, state }, contactId) {
      console.log(`setActiveContact ${contactId}`);
      const contact = state.contacts.find((c) => c.id === contactId);
      if (contact) {
        commit('setContact', contact);
      }
    },
    getContacts({ state }, userId) {
      console.log(`getContacts ${userId}`);
      const socket = state.socket;
      socket.emit('contacts', userId);
    },
    newChat({ state }, memberId) {
      console.log(`newChat ${memberId}`);
      const socket = state.socket;
      socket.emit('new chat', memberId);
    },
    addAlertMessage({ commit, state }, { text, type, caption }) {
      const id = state.alertId;
      console.dir({ id, text, type, caption });
      commit('addAlertMessage', { id, text, type, caption });
      commit('incAlertId');
    },
    removeAlertMessage({ commit }, messageId) {
      commit('removeAlertMessage', messageId);
    },
  },
  modules: {
    http,
    auth,
  },
});
