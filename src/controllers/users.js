const User = require('../models/user');
const AppErrors = require('../appErrors/appErrors');
const Helpers = require('../utils/helpers');

const fields = '-__v';

module.exports.getUsers = (req, res) => {
  User.find({}, fields)
    .then((users) => res.send({ data: users }))
    .catch(() => res
      .status(AppErrors.ERROR_CODE_SERVER_ERROR)
      .send({ message: AppErrors.ERROR_SERVER }));
};

module.exports.getUser = (req, res) => {
  const id = Helpers.getMongoId(req.params.userId);
  if (!id) {
    res.status(AppErrors.ERROR_CODE_BAD_REQUEST).send({ message: AppErrors.ERROR_PARAMS });
    return;
  }

  User.findById(id, fields, { runValidators: true })
    .then((result) => {
      if (!result) {
        res
          .status(AppErrors.ERROR_CODE_NOT_FOUND)
          .send({ message: AppErrors.ERROR_USER_NOT_FOUND });
        return;
      }
      res.send({ data: result });
    })
    .catch(() => {
      res
        .status(AppErrors.ERROR_CODE_SERVER_ERROR)
        .send({ message: AppErrors.ERROR_SERVER });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((result) => {
      res.send({
        data: {
          _id: result._id, name, about, avatar,
        },
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res
          .status(AppErrors.ERROR_CODE_BAD_REQUEST)
          .send({ message: AppErrors.ERROR_NEW_USER_PARAMS });
      }
      return res
        .status(AppErrors.ERROR_CODE_SERVER_ERROR)
        .send({ message: AppErrors.ERROR_SERVER });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  User.findOneAndUpdate(
    { _id: req.user._id },
    { name, about },
    { new: true, runValidators: true, fields },
  )
    .then((result) => {
      if (!result) {
        return res
          .status(AppErrors.ERROR_CODE_NOT_FOUND)
          .send({ message: AppErrors.ERROR_USER_NOT_FOUND });
      }
      return res.send({ data: result });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res
          .status(AppErrors.ERROR_CODE_BAD_REQUEST)
          .send({ message: AppErrors.ERROR_EDIT_USER_PARAMS });
      }
      return res
        .status(AppErrors.ERROR_CODE_SERVER_ERROR)
        .send({ message: AppErrors.ERROR_SERVER });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findOneAndUpdate(
    { _id: req.user._id },
    { avatar },
    { new: true, runValidators: true, fields },
  )
    .then((result) => {
      if (!result) {
        return res
          .status(AppErrors.ERROR_CODE_NOT_FOUND)
          .send({ message: AppErrors.ERROR_USER_NOT_FOUND });
      }
      return res.send({ data: result });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res
          .status(AppErrors.ERROR_CODE_BAD_REQUEST)
          .send({ message: AppErrors.ERROR_EDIT_AVATAR_PARAMS });
      }
      return res
        .status(AppErrors.ERROR_CODE_SERVER_ERROR)
        .send({ message: AppErrors.ERROR_SERVER });
    });
};
