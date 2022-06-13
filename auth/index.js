const UserService = require('../user/User.Service');

/** записує в req.usr користувача, якщо в сесії знаходить збережений userId
 * та в БД є такий користувач,
 * @param { Request } req Об'єкт запиту
 * @param { Response } res Об'єкт відповіді
 * @param { NextFunction } next Функція, яка продовжує обробку запиту
 */
async function authentication(req, res, next) {
  console.log('authentication');
  try {
    if (req.session && req.session.userId) {
      const userId = req.session.userId;
      const user = await deserializeUser(userId);
      if (!user) {
        delete req['user'];
      }
      req.user = user;
    } else {
      delete req['user'];
    }
  } catch (error) {
    if (!error.type) {
      error.type = 'auth error';
    }
    if (!error.source) {
      error.source = 'auth authentication';
    }
    console.log(error);
  }
  next();
}

/** використовується для отримання інф. про користувача
 * @param { number } id ідентифікатор користувача
 * @returns { Promise<{id : number, login: string, user_name: string,
 * avatar: string; state: number, created_at:Date, modified_at:Date} | null> }
 */
async function deserializeUser(id) {
  console.log('deserializeUser');
  let userService;
  try {
    userService = await UserService.createService();
    const user = await userService.getUser(id);
    if (Object.keys(user).length === 0) {
      return null;
    }
    return user;
  } catch (error) {
    if (!error.type) {
      error.type = 'auth error';
    }
    if (!error.source) {
      error.source = 'auth deserializeUser';
    }
    console.dir(error);
    throw error;
  } finally {
    if (userService) {
      userService.release();
    }
  }
}

/** Процедура входу користувача за його логіном та паролем
 *
 * @param { Request } req Об'єкт запиту
 * @param { Response } res Об'єкт відповіді
 * @returns {Promise<{id : number, login: string, user_name: string,
 * state: number, created_at:Date, modified_at:Date} | HTTP_ERROR 401|500>}
 */
async function loginHandler(req, res) {
  let userService;
  try {
    if (req.session.userId) {
      delete req.session['userId'];
    }
    const { login, password } = req.body;
    userService = await UserService.createService();
    const user = await userService.checkUser(login, password);
    if (user === false) {
      res.status(401).json({ message: 'Помилковий логін або пароль.' });
      return;
    }

    req.session.userId = user.id;
    console.log(`write ${user.id} into req.session.userId`);
    res.json(user);
    return;
  } catch (error) {
    console.dir(error);
    res.status(500).json({ message: error.message });
  } finally {
    userService.release();
  }
}

/** Процедура входу користувача за його логіном та паролем
 *
 * @param { Request } req Об'єкт запиту
 * @param { Response } res Об'єкт відповіді
 * @returns {Promise<{id : number, login: string, user_name: string,
 * state: number, created_at:Date, modified_at:Date} | HTTP_ERROR 401|500>}
 */
async function registerHandler(req, res) {
  let userService;
  try {
    if (req.session.userId) {
      delete req.session['userId'];
    }
    const { login, password, username } = req.body;
    userService = await UserService.createService();
    const user = await userService.createUser(login, username, password);
    if (user === false) {
      res.status(400).json({ message: 'Помилка створення користувача.' });
      return;
    }
    req.session.userId = user.id;
    res.json(user);
    return;
  } catch (error) {
    console.dir(error);
    res.status(500).json({ message: error.message });
  } finally {
    userService.release();
  }
}

/** Повертає користувача за ID в сесії
 *
 * @param { Request } req Об'єкт запиту
 * @param { Response } res Об'єкт відповіді
 * @returns { Promise<{id : number, login: string, user_name: string,
 * state: number, created_at:Date, modified_at:Date} | HTTP_ERROR 500> }
 */
async function authUserHandler(req, res) {
  //
  let user = null;
  try {
    if (req.session && req.session.userId) {
      user = await deserializeUser(req.session.userId);
    }
    res.json(user);
    return;
  } catch (error) {
    console.dir(error);
    res.status(500).json({ message: error.message });
  }
}

/** Процедура виходу користувача та закриття сесії
 *
 * @param { Request } req Об'єкт запиту
 * @param { Response } res Об'єкт відповіді
 * @returns { boolean }
 */
async function logoutHandler(req, res) {
  // можливо треба прочитати сесію з запиту та для неї встановити кінець
  res.cookie('connect.sid', '', { expires: new Date() });
  try {
    if (req.session) await req.session.destroy();
  } catch (error) {
    console.log(error);
  }
  res.json(true);
  return;
}

module.exports = {
  authentication,
  loginHandler,
  authUserHandler,
  logoutHandler,
  registerHandler,
};
