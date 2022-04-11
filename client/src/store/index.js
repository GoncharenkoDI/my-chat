import Vue from 'vue';
import Vuex from 'vuex';

import io from 'socket.io-client';

import http from './http';
import auth from './auth';

Vue.use(Vuex);

//const ENDPOINT = 'http://localhost:5000/';

export default new Vuex.Store({
  state: {
    user: {},
    contact: {},
    roomUsers: [],
    /**
     * @var { {room_id : string, member: number, room_name: string,
     * created_at:Date, modified_at:Date} } room
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
    setRoomInRooms(state, room) {
      console.log(`setRoomInRooms, ${JSON.stringify(room)}`);
      if (room && Object.keys(room).length > 0) {
        console.log(`really add room, ${JSON.stringify(room)}`);
        const index = state.rooms.findIndex((r) => r.room_id === room.room_id);
        if (index === -1) {
          state.rooms.push(room);
        } else state.rooms[index] = room;
      }
      console.dir(state.rooms);
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
    // getUserRooms(state) {
    //   const user = state.user;
    // }
    roomsInArray(state) {
      if (state.rooms) {
        return [...state.rooms.values()];
      } else {
        return [];
      }
    },
  },
  actions: {
    async newConnection({ state, commit, dispatch }) {
      const socket = await io(window.location.href, {
        transports: ['websocket'],
      });
      console.log('windows location = ', window.location.href);
      socket.on('connect', async () => {
        console.log(`on connect. Ідентифікатор сокету - ${socket.id}`);
        if (socket.connected) {
          console.log('socket.connected');
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
          'send rooms',
          /**
           * @param {[{room_id : string, member: number, room_name: string,
           * created_at:Date, modified_at:Date}]} rooms
           */
          async (rooms) => {
            console.log(`on send rooms ${JSON.stringify(rooms)}`);
            commit('setRooms', rooms);
          }
        );
        socket.on('i am is', (user) => {
          console.log(`on i am is ${JSON.stringify(user)}`);
          commit('setUser', user);
        });
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
          console.log(`on message ${message}`);
          commit('addMessage', message);
        });
        socket.on('new chat', (sendRoom, isOwner, contact) => {
          console.log(
            `on new chat.
              Room- ${JSON.stringify(sendRoom)},
              isOwner- ${isOwner},
              contact- ${JSON.stringify(contact)}`
          );

          commit('setRoom', sendRoom);
          commit('removeContact', contact);
          if (isOwner) {
            state.socket.emit('join', sendRoom.room_id, (messages, roomId) => {
              console.log(`join відповідь повідомлення - ${JSON.stringify(
                messages
              )},
              кімната - ${roomId}`);
              const room = state.rooms.find((r) => r.room_id === roomId);
              commit('setRoomInRooms', room);
              commit('setMessages', messages);
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
        commit('setSocket', null);
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
        return;
      }
      const room = state.rooms.find((r) => r.room_id === roomId);
      commit('setRoom', room);
      state.socket.emit('join', roomId, (messages) => {
        commit('setMessages', messages);
      });
    },
    sendMessage({ state }, text) {
      console.log(`sendMessage text: ${text}`);
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
      if (!room) {
        console.log('Ви не ввійшли до кімнати');
        return;
      }
      if (text.length === 0) {
        return;
      }
      const user = state.user;
      if (!room) {
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
      const contact = state.contacts.find((c) => c.id === contactId);
      commit('setContact', contact);
    },
    getContacts({ state }, userId) {
      const socket = state.socket;
      socket.emit('contacts', userId);
    },
    newChat({ state }, memberId) {
      const socket = state.socket;
      socket.emit('new chat', memberId);
    },
  },
  modules: {
    http,
    auth,
  },
});
