const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const AppErrors = require('./appErrors/appErrors');
const { requestLogger, errorLogger } = require('./middlewares/logger');

// подключаем валидацию создания пользователя и логина
const {
  validationCreateUser,
  validationLogin,
} = require('./middlewares/validation');
const NotFoundError = require('./appErrors/not-found-err');

// читаем переменные окружения из .env файла
require('dotenv').config();

const { PORT = 3000, BASE_PATH = 'public' } = process.env;
const app = express();

// подключаем логгер запросов
app.use(requestLogger);

// подключаем библиотеки парсинга тела запроса
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// подключаемся к БД MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

// доступ к авторизации и созданию пользователя
app.post('/signup', validationCreateUser, createUser);
app.post('/signin', validationLogin, login);

// проверяем авторизацию
app.use(auth);

// доступные роуты после авторизации
app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

// подключаем каталог для раздачи статики
const fullStaticPath = path.join(__dirname, BASE_PATH);
app.use(express.static(fullStaticPath));

// обрабатываем все неизвестные роуты
app.use((req, res, next) => next(new NotFoundError(AppErrors.ERROR_BAD_REQUEST)));

// подключаем логгер ошибок
app.use(errorLogger);

// обработчики ошибок предварительной валидации
app.use(errors()); // обработчик ошибок celebrate.

// централизованный обработчик ошибок
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
    });
});

// начинаем прослушивание порта
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Каталог для статических файлов ${fullStaticPath}`);
});
