'use strict';
require('dotenv').config();
//console.log(process.env);
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

const server = require('http').createServer(app);

//const serverConfig = require('./config/server.config');
//const dbConfig = require('./config/db.config');

//const PUBLIC = path.resolve(__dirname, serverConfig.PUBLIC);
// const PORT = serverConfig.PORT;
// console.dir({
//   public: PUBLIC,
//   env: path.resolve(__dirname, process.env.CHAT_PUBLIC),
// });
//const PUBLIC = path.resolve(__dirname, process.env.PUBLIC);
//const PORT = process.env.PORT;
//const { SESSION_MAX_AGE, SESSION_SECRET } = require('./config/secret.config');

/*
DATABASE_URL="postgresql://honcharenko:241100@localhost:5432/vue-chat"
PORT=8080
PUBLIC_PATH="./client/dist"
SECRET= "Ну дуже секретне слово"
SALT= 12
EXPIRED_INTERVAL= 2592000000
MAX_SESSIONS= 5
SESSION_SECRET= "Ще секретніше слово"
SESSION_EXPIRES= 86400000
*/
const {
  PORT = 5000,
  PUBLIC_PATH = './client/dist',
  SESSION_SECRET,
  SESSION_MAX_AGE,
} = process.env;
const activeSockets = new Map();
const activeUsers = new Map();

console.log(`PUBLIC_PATH - ${path.resolve(__dirname, PUBLIC_PATH)}`);
app.use(express.static(path.resolve(__dirname, PUBLIC_PATH)));

const {
  authentication,
  loginHandler,
  authUserHandler,
  logoutHandler,
  registerHandler,
} = require('./auth');
const { getUserRooms, createPrivateChat } = require('./room');
const { getMessagesInRoom, addMessage } = require('./message');
const { getContacts } = require('./user');

app.use(bodyParser.json({}));

const expressSession = require('express-session');
const { getPool } = require('./db');
const pool = getPool();
const session = expressSession({
  store: new (require('connect-pg-simple')(expressSession))({
    pool,
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: SESSION_MAX_AGE },
});

app.use(session);

app.use(cors());

app.use(authentication);

app.post('/api/login', loginHandler);
app.get('/api/login-user/', authUserHandler);
app.post('/api/register', registerHandler);
app.get('*', (req, res) => {
  res.redirect('/');
});

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:8080',
  },
});

app.post('/api/logout', (req, res) => {
  const socketId = req.session.socketId;
  if (socketId && io.of('/').sockets.get(socketId)) {
    const socket = io.of('/').sockets.get(socketId);
    console.log(`forcefully closing socket ${socketId}`);
    socket.disconnect(true);
  }
  logoutHandler(req, res);
});

//convert a connect middleware to a Socket.IO middleware
const wrap = (middleware) => (socket, next) => {
  console.log('middleware.name - ', middleware.name);
  return middleware(socket.request, {}, next);
};

io.use(wrap(session));
io.use(wrap(authentication));

io.use((socket, next) => {
  if (socket.request.user) {
    console.log('авторизувався');
    next();
  } else {
    console.log('не авторизувався');
    console.dir(socket.request.session);
    next(new Error('unauthorized'));
  }
});

io.on('connect', async (socket) => {
  console.log(`new connection ${socket.id}`);

  const session = socket.request.session;

  if (session) {
    console.log(`saving sid ${socket.id} in session ${session.id}`);
    session.socketId = socket.id;
    session.save();
  }
  /**
   * @constant {{id : number, login: string, user_name: string,
   * state: number, created_at:Date, modified_at:Date}} user
   */
  const user = socket.request.user;

  if (!user) {
    console.log('not user');
    socket.disconnect(true);
    return;
  }

  console.log(
    `З'єднання з sid ${socket.id}
    та користувачем з id ${user.id} записуємо в activeSockets`
  );

  activeSockets.set(socket.id, { socket, user });
  if (!activeUsers.has(user.id)) {
    activeUsers.set(user.id, []);
  }

  const sockets = activeUsers.get(user.id);
  sockets.push(socket.id);

  const rooms = await getUserRooms(user.id);

  socket.emit('rooms', rooms);
  socket.emit('user', user);

  socket.on('get rooms', async (callback) => {
    const rooms = await getUserRooms(user.id);
    callback(rooms);
  });

  socket.on('new chat', async (memberId) => {
    console.log(`new chat execute with memberId = ${memberId}`);
    const roomUsers = await createPrivateChat(memberId, user);
    if (roomUsers.length === 0) {
      console.log('Не вийшло створити новий чат');
      return;
    }
    //const roomId = roomUsers[0].room_id;
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
  });

  socket.on('disconnect', (reason) => {
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
  });

  let activeRoom;
  socket.on('join', async (roomId, callback) => {
    const rooms = socket.rooms;
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
  });

  socket.on('who am i', async (callback) => {
    console.log(`I am ${user.user_name}`);
    callback(user);
  });

  socket.on('contacts', async (userId) => {
    const contacts = await getContacts(userId);
    socket.emit('contacts', contacts);
  });

  socket.on('message', async (message) => {
    try {
      const newMessage = await addMessage(message);
      if (Object.keys(newMessage).length === 0) {
        console.log('Не вдалось записати повідомлення.');
        console.dir(message);
        console.dir(user);
        console.dir({ activeRoom });
        return;
      }
      if (newMessage.author !== user.id) {
        console.log('Відправник не відповідає поточному користувачу.');
        console.dir({ userId: user.id, newMessageAuthor: newMessage.author });
        console.dir(newMessage);
        console.dir(message);
        console.dir(user);
        console.dir({ activeRoom });
        return;
      }
      // eslint-disable-next-line camelcase
      newMessage.user_name = user.user_name;
      if (newMessage.destination !== activeRoom) {
        console.log('Призначення повідомлення не відповідає активній кімнаті.');
        console.dir(message);
        console.dir(newMessage);
        console.dir(user);
        console.dir({ activeRoom });
        return;
      }
      io.to(activeRoom).emit('message', newMessage);
    } catch (error) {
      console.dir(error);
      console.dir(message);
      //console.dir(newMessage);
      console.dir(user);
      console.dir({ activeRoom });
    }
  });
});

server.listen(PORT, () => {
  console.log(`application is running at: http://localhost:${PORT}`);
});
