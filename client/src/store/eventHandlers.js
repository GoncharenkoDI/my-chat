/** Перелік кімнат з сервера
 * @param {[{room_id : string, member: number, room_name: string,
 * created_at:Date, modified_at:Date}]} rooms
 */
export function onRooms(rooms, commit) {
  console.log(`on rooms ${JSON.stringify(rooms)}`);
  commit('setRooms', rooms);
  return;
}
/**Користувач в поточному socket
 * @param { {id : number, login: string, user_name: string,
 * state: number, created_at:Date, modified_at:Date} } user
 */
export function onUser(user, commit) {
  console.log(`on i am is ${JSON.stringify(user)}`);
  commit('setUser', user);
  return;
}

export function onContacts(contacts, state, commit) {
  console.log(`on contacts ${JSON.stringify(contacts)}`);
  const contact = state.contact;
  if (Object.keys(contact) !== 0) {
    const index = contacts.findIndex((c) => c.id === contact.id);
    if (index === -1) {
      commit('setContact', {});
    }
  }
  commit('setContacts', contacts);
  return;
}

export function onMessage(message, commit) {
  console.log(`on message ${JSON.stringify(message)}`);
  commit('updateMessage', message);
  return;
}

export function onNewChat(sendRoom, isOwner, contact, commit, state) {
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
      console.log(`join відповідь повідомлення - ${JSON.stringify(messages)},
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
  return;
}

export function onConnectError(error, socket, commit) {
  console.log(`Відбулась помилка з'єднання: ${error.message}!`);
  if (error.message === 'unauthorized') {
    socket.disconnect(true);
  }
  commit('setConnectionError', error.message);
  return;
}

export function onDisconnect(reason, commit) {
  console.log(`З'єднання розірване, причина - ${reason}.`);
  commit('setUser', {});
  commit('setContact', {});
  commit('setRoom', {});
  commit('setRooms', []);
  commit('setMessages', []);
  commit('setContacts', []);
  commit('setSocket', null);
  return;
}

export function onServerError(error) {
  console.error(error);
  return;
}
