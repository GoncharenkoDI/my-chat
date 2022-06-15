require('dotenv').config();
console.log(process.env.NODE_ENV);
const path = require('path');
const express = require('express');
//const cors = require('cors');
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
  logoutHandler,
  registerHandler,
} = require('./auth');
const { getUserRooms } = require('./room');

const { setHandlers } = require('./handlers');

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

//app.use(cors());

app.use(authentication);

app.post('/api/login', loginHandler);
app.post('/api/register', registerHandler);
app.get('*', (req, res) => {
  res.redirect('/');
});

const io = require('socket.io')(server, {
  // cors: {
  //   origin: 'http://localhost:8080',
  // },
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
    let activeRoom;
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
    // eslint-disable-next-line prefer-const
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

    setHandlers(socket, user, activeUsers, io, activeSockets, activeRoom);
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
