const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const AppErrors = require('../appErrors/appErrors');
const AuthErr = require('../appErrors/auth-error');

const { isValidUrl } = require('../utils/helpers');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator: isValidUrl,
      message: 'Не корректная ссылка',
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    validate: {
      validator: validator.isEmail,
      message: 'Не корректный адрес электронной почты',
    },
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  const error = new AuthErr(AppErrors.ERROR_LOGIN_PASSWORD);

  return this.findOne({ email }, 'email password')
    .then((user) => {
      if (!user) return Promise.reject(error);
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) return Promise.reject(error);
          return { _id: user._id };
        });
    });
};

module.exports = mongoose.model('user', userSchema);
