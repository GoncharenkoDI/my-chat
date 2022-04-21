import Vue from 'vue';
import Vuex from 'vuex';

import io from 'socket.io-client';

import http from './http';
import auth from './auth';

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
    messages: [],
    contacts: [],
    connectionError: null,
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
     * @param { {id: number, login: string, user_name: string, state: string, created_at: Date, modified_at: Date
     * } } contact
     */
    setContact(state, contact) {
      state.contact = contact;
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
          console.log("З'єднання НЕ встановлено");
          commit('setSocket', null);
        }

        socket.on(
          'rooms',
          /** Перелік кімнат з сервера для користувача
           * @param {[{room_id : string, member: number, room_name: string,
           * created_at:Date, modified_at:Date}]} rooms
           */
          (rooms) => {
            console.log(`on rooms ${JSON.stringify(rooms)}`);
            commit('setRooms', rooms);
          }
        );

        socket.on(
          'user',
          /**
           * @param { {id : number, login: string, user_name: string,
           * state: number, created_at:Date, modified_at:Date} } user
           */
          (user) => {
            console.log(`on i am is ${JSON.stringify(user)}`);
            commit('setUser', user);
          }
        );

        socket.on('contacts', (contacts) => {
          console.log(`on contacts ${JSON.stringify(contacts)}`);
          const contact = state.contact;
          if (Object.keys(contact) !== 0) {
            const index = contacts.findIndex((c) => c.id === contact.id);
            if (index === -1) {
              commit('setContact', {});
            }
          }
          commit('setContacts', contacts);
        });

        socket.on('message', (message) => {
          console.log(`on message ${JSON.stringify(message)}`);
          commit('addMessage', message);
        });

        socket.on('new chat', (sendRoom, isOwner, contact) => {
          console.log(
            `on new chat.
              Room- ${JSON.stringify(sendRoom)},
              isOwner- ${isOwner},
              contact- ${JSON.stringify(contact)}`
          );

          commit('addRoom', sendRoom);
          commit('removeContact', contact);
          if (isOwner) {
            state.socket.emit('join', sendRoom.room_id, (messages, roomId) => {
              console.log(`join відповідь повідомлення - ${JSON.stringify(
                messages
              )},
              кімната - ${roomId}`);
              const room = state.rooms.find((r) => r.room_id === roomId);
              if (room) {
                commit('setRoom', room);
                commit('setMessages', messages);
              } else {
                commit('setRoom', {});
                commit('setMessages', []);
              }
            });
          }
        });
      });

      socket.on('connect_error', async (error) => {
        console.log(`Відбулась помилка з\'єднання: ${error.message}!`);
        if (error.message === 'unauthorized') {
          socket.disconnect(true);
        }
        commit('setConnectionError', error.message);
      });

      socket.on('disconnect', async (reason) => {
        console.log(`З\'єднання розірване, причина - ${reason}.`);
        commit('setUser', {});
        commit('setContact', {});
        commit('setRoom', {});
        commit('setRooms', []);
        commit('setMessages', []);
        commit('setContacts', []);
        commit('setSocket', null);
      });

      socket.on('server error', (error) => {
        console.error(error);
      });
    },
    changeRoom({ commit, state }, roomId) {
      console.log('change room', roomId);
      const socket = state.socket;
      if (!socket) {
        console.log("Відсутнє з'єднання1");
        return;
      }
      if (!socket.connected) {
        console.log("Відсутнє з'єднання2");
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
        console.log("Відсутнє з'єднання1");
        return;
      }
      if (!socket.connected) {
        console.log("Відсутнє з'єднання2");
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
  },
  modules: {
    http,
    auth,
  },
});
