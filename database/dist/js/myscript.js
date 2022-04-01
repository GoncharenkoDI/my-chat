//const socket = io();
//console.dir(socket);
const signButton = document.getElementById('sign');
const userButton = document.getElementById('user');
const connectButton = document.getElementById('connect');
const logoutButton = document.getElementById('logout');

const getUser = async (event) => {
  event.preventDefault();
  event.stopPropagation();
  const url = '/api/login-user';
  const method = 'GET';
  const headers = {};
  headers['Content-Type'] = 'application/json';
  const response = await fetch(url, {
    method,
    credentials: 'include', // include, *same-origin, omit
    headers,
  });
  console.dir(await response.json());
};

const login = async (event) => {
  event.preventDefault();
  event.stopPropagation();
  const url = '/api/login';
  const method = 'POST';
  const body = { login: 'user1', password: 'user1' };
  const headers = {};
  headers['Content-Type'] = 'application/json';
  const response = await fetch(url, {
    method: 'POST',
    //credentials: 'include', // include, *same-origin, omit
    body: JSON.stringify({ login: 'user1', password: 'user1' }),
    headers: { 'Content-Type': 'application/json' },
  });
  console.dir(await response.json());
};

const connect = async (event) => {
  event.preventDefault();
  event.stopPropagation();
  const socket = io();
  console.log('connect procedure...');
  socket.on('connect', () => {
    console.log(`Ідентифікатор сокету - ${socket.id}`);
    if (socket.connected) {
      console.log("З'єднання встановлено");
    } else {
      console.log("З'єднання НЕ встановлено");
    }
  });
  socket.on('connect_error', (error) => {
    console.log(`Відбулась помилка з\'єднання: ${error}!`);
  });
  socket.on('disconnect', (reason) => {
    console.log(`З\'єднання розірване, причина - ${reason}.`);
  });
};

const logout = async (event) => {
  event.preventDefault();
  event.stopPropagation();
  console.log('logout');
  const url = '/api/logout';
  const method = 'POST';
  const body = JSON.stringify({});
  const headers = {};
  headers['Content-Type'] = 'application/json';
  const response = await fetch(url, {
    method,
    //credentials: 'include', // include, *same-origin, omit
    body,
    headers,
  });
  console.dir(await response.json());
};

signButton.addEventListener('click', login);

userButton.addEventListener('click', getUser);

connectButton.addEventListener('click', connect);

logoutButton.addEventListener('click', logout);
// socket.on('connect', () => {
//   socketIdSpan.innerText = socket.id;

//   socket.emit('whoami', (username) => {
//     usernameSpan.innerText = username;
//   });
// });

// let isConnected = socket.connected;
// console.log(isConnected);
// if (isConnected) {
//   submitButton.value = 'Log Out';
// } else {
//   submitButton.value = 'Log In';
// }
