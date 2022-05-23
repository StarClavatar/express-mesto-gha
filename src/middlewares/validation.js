const { celebrate, Joi } = require('celebrate');

// eslint-disable-next-line no-useless-escape
const linkRegExp = /^https?:\/\/(www\.)?[\w\-\._~:\/\?#\[\]@!\$&'\(\)\*\+,;=]+\.[\w\-\._~:\/\?#\[\]@!\$&'\(\)\*\+,;=а-я]+#?/i;

const validationMongoId = celebrate({
  params: Joi.object().keys({
    _id: Joi.string().alphanum().length(24),
  }),
});

const validationCreateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(20),
    avatar: Joi.string().pattern(linkRegExp),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const validationLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const validationEditUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(20),
  }),
});

const validationEditAvatar = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(linkRegExp),
  }),
});

const validationCreateCard = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(linkRegExp),
  }),
});

module.exports = {
  validationMongoId,
  validationCreateUser,
  validationLogin,
  validationEditUser,
  validationEditAvatar,
  validationCreateCard,
};
