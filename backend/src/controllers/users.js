const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

const User = require('../models/user');
const Helpers = require('../utils/helpers');

const AppErrors = require('../appErrors/appErrors');
const BadRequestErr = require('../appErrors/bad-request-error');
const NotFoundErr = require('../appErrors/not-found-err');
const NotUniqueEmailErr = require('../appErrors/not-unique-email');
const AuthError = require('../appErrors/auth-error');

const fields = '-__v';

// загрузка всех пользователей из БД
module.exports.getUsers = (req, res, next) => {
  User.find({}, fields)
    .then((users) => res.send(users))
    .catch(next);
};

function getUserById(userId) {
  return new Promise((resolve, reject) => {
    // проверяем корректность идентификатора
    const id = Helpers.getMongoId(userId);
    if (!id) reject(new BadRequestErr(AppErrors.ERROR_ICORRECT_USER_ID));

    // ищем в БД по идентификатору
    User.findById(id, fields, { runValidators: true })
      .then((result) => {
        if (!result) reject(new NotFoundErr(AppErrors.ERROR_USER_NOT_FOUND));
        resolve(result);
      })
      .catch((err) => reject(err));
  });
}

// загрузка информации пользователя из БД
module.exports.getUser = (req, res, next) => {
  getUserById(req.params._id)
    .then((data) => res.status(200).send(data))
    .catch(next);
};

// загрузка информации о текущем пользователе
module.exports.getMe = (req, res, next) => {
  getUserById(req.user._id)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch(next);
};

// создание нового пользователя
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, about, avatar, email, password: hash,
      })
        .then((result) => {
          res.send({
            _id: result._id, name, about, avatar, email,
          });
        })
        .catch((err) => {
          if (err.code === 11000) {
            return next(new NotUniqueEmailErr(AppErrors.ERROR_EMAIL_ALREDY_EXISTS));
          }
          if (err.name === 'ValidationError') {
            return next(new BadRequestErr(AppErrors.ERROR_NEW_USER_PARAMS));
          }
          return next(err);
        });
    });
};

// обновление пользователя
module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findOneAndUpdate(
    { _id: req.user._id },
    { name, about },
    { new: true, runValidators: true, fields },
  )
    .then((result) => {
      if (!result) throw new NotFoundErr(AppErrors.ERROR_USER_NOT_FOUND);
      return res.send(result);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') return next(new BadRequestErr(AppErrors.ERROR_EDIT_USER_PARAMS));
      return next(err);
    });
};

// обновление авартара пользователя
module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findOneAndUpdate(
    { _id: req.user._id },
    { avatar },
    { new: true, runValidators: true, fields },
  )
    .then((result) => {
      if (!result) throw new NotFoundErr(AppErrors.ERROR_USER_NOT_FOUND);
      return res.send(result);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') return next(new BadRequestErr(AppErrors.ERROR_EDIT_AVATAR_PARAMS));
      return next(err);
    });
};

// обработка логина
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
        { expiresIn: '7d' },
      );
      res.status(200).send({ token });
    })
    .catch(() => {
      next(new AuthError(AppErrors.ERROR_LOGIN));
    });
};
