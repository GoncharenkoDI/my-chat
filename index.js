require('dotenv').config();
console.log(process.env.NODE_ENV);
const path = require('path');
const fs = require('fs').promises;
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
  SESSION_EXPIRES,
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
const { getContacts, updateUser, getUser } = require('./user');

app.use(bodyParser.json({}));

const expressSession = require('express-session');
const { getPool } = require('./db');
const { emit } = require('process');
const pool = getPool();
const maxAge = +SESSION_EXPIRES;
console.log({ maxAge });
const session = expressSession({
  store: new (require('connect-pg-simple')(expressSession))({
    pool,
  }),
  secret: SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  cookie: { maxAge: +SESSION_EXPIRES },
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
  try {
    console.log(`new connection ${socket.id}`);

    const session = socket.request.session;

    if (session) {
      console.log(`saving sid ${socket.id} in session ${session.id}`);
      session.socketId = socket.id;
      session.save();
    }
    /**
     * @type {{id : number, login: string, user_name: string,
     * avatar: string; state: number, created_at:Date, modified_at:Date}}
     */
    let user = socket.request.user;

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

    /** @type [] */
    const sockets = activeUsers.get(user.id);
    sockets.push(socket.id);

    const rooms = await getUserRooms(user.id);
    socket.emit('rooms', rooms);
    socket.emit('user', user);

    socket.on('get rooms', async (callback) => {
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
    });

    socket.on('new chat', async (memberId) => {
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
        emit('server error', error);
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
        emit('server error', error);
      }
    });

    socket.on('who am i', async (callback) => {
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
        emit('server error', error);
      }
    });

    socket.on('contacts', async (userId) => {
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
        emit('server error', error);
      }
    });

    socket.on('message', async (message) => {
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
        emit('server error', error);
      }
    });

    socket.on('update user', async (data) => {
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
    });
  } catch (error) {
    if (!error.type) {
      error.type = 'server error';
    }
    if (!error.source) {
      error.source = 'index on connect';
      console.log(error);
    }
    emit('server error', error);
  }
});

server.listen(PORT, () => {
  console.log(`application is running at: http://localhost:${PORT}`);
});
