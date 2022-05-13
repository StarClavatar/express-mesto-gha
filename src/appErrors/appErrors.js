const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_BAD_REQUEST = 400;
const ERROR_CODE_SERVER_ERROR = 500;

const ERROR_USER_NOT_FOUND = 'пользователь с указанным _id не найден';
const ERROR_NEW_USER_PARAMS = 'Переданы некорректные данные при создании пользователя';
const ERROR_EDIT_USER_PARAMS = 'Переданы некорректные данные при редактировании профиля';
const ERROR_EDIT_AVATAR_PARAMS = 'Переданы некорректные данные при редактировании аватара';

const ERROR_CARD_NOT_FOUND = 'Карточка с указанным _id не найдена';
const ERROR_NEW_CARD_PARAMS = 'Переданы некорректные данные при создании карточки';
const ERROR_CARD_LIKES_PARAMS = ' Переданы некорректные данные для постановки/снятии лайка.';

const ERROR_SERVER = 'Ошибка сервера';

module.exports = {
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_SERVER_ERROR,
  ERROR_USER_NOT_FOUND,
  ERROR_NEW_USER_PARAMS,
  ERROR_EDIT_USER_PARAMS,
  ERROR_EDIT_AVATAR_PARAMS,
  ERROR_CARD_NOT_FOUND,
  ERROR_NEW_CARD_PARAMS,
  ERROR_CARD_LIKES_PARAMS,
  ERROR_SERVER,
};
