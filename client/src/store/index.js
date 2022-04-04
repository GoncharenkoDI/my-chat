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
    room: {},
    rooms: [],
    socket: null,
    messages: [],
    contacts: [],
    connectionError: null,
  },
  mutations: {
    setUser(state, user) {
      if (user) {
        state.user = user;
      } else {
        state.user = {};
      }
    },
    setRoomUsers(state, users) {
      state.roomUsers = users;
    },
    setRoom(state, room) {
      if (room) {
        state.room = room;
      } else {
        state.room = {};
      }
    },
    setRooms(state, rooms) {
      state.rooms = rooms;
    },
    addRoom(state, room) {
      state.rooms.push(room);
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
      console.dir({ contacts: state.contacts, contactId });
      state.contacts = state.contacts.filter(c => +c.id !== +contactId);
      console.log(state.contacts);
    },
    /**
     *
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
  },
  actions: {
    newConnection({ state, commit, dispatch }) {
      const socket = io(window.location.href, { transports: ['websocket'] });
      console.log('windows location = ', window.location.href);
      socket.on('connect', async () => {
        console.log(`Ідентифікатор сокету - ${socket.id}`);
        console.log(`socket.connected - ${socket.connected}`);
        if (socket.connected) {
          console.log('socket.connected');
          socket.emit('who am i', async user => {
            console.log('who am i');
            commit('setUser', user);
          });
          commit('setSocket', socket);
        } else {
          console.log("З'єднання НЕ встановлено");
          commit('setSocket', null);
        }
        socket.on('send rooms', async rooms => {
          commit('setRooms', rooms);
        });
        socket.on('i am is', user => {
          commit('setUser', user);
        });
        socket.on('contacts', contacts => {
          const contact = state.contact;
          if (Object.keys(contact) !== 0) {
            const index = contacts.findIndex(c => c.id === contact.id);
            if (index === -1) {
              commit('setContact', {});
            }
          }
          commit('setContacts', contacts);
        });
        socket.on('message', message => {
          console.dir(message);
          commit('addMessage', message);
        });
        socket.on('new chat', (sendRoom, isOwner, contact) => {
          console.dir({ sendRoom, isOwner, contact });
          commit('addRoom', sendRoom);
          commit('removeContact', contact);
          if (isOwner) {
            dispatch('changeRoom', sendRoom.room_id);
          }
        });
      });
      socket.on('connect_error', error => {
        console.log(`Відбулась помилка з\'єднання: ${error.message}!`);
        if (error.message === 'unauthorized') {
          socket.disconnect(true);
        }
        commit('setConnectionError', error.message);
      });
      socket.on('disconnect', reason => {
        console.log(`З\'єднання розірване, причина - ${reason}.`);
        commit('setSocket', null);
      });
    },
    changeRoom({ commit, state }, roomId) {
      const room = state.rooms.find(r => r.room_id === roomId);
      commit('setRoom', room);
      state.socket.emit('join', roomId, messages => {
        commit('setMessages', messages);
      });
    },
    sendMessage({ state }, text) {
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
        console.log('Ви не ввійли до програми');
        return;
      }
      socket.emit('message', {
        author: user.id,
        destination: room.room_id,
        text,
      });
    },
    setActiveContact({ commit, state }, contactId) {
      const contact = state.contacts.find(c => c.id === contactId);
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
