const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// const { PORT = 3000, BASE_PATH } = process.env;
const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect('mongodb://localhost:27017/mestodb');

// затычка пока нет авторизации
app.use((req, res, next) => {
  req.user = {
    _id: '5d8b8592978f8bd833ca8133', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };
  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => res.status(404).send({ message: 'неправильный запрос' }));

app.listen(PORT, () => {
  // console.log(`Сервер запущен на порту ${PORT}`);
  // console.log(BASE_PATH);
});
