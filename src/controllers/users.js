const { ObjectId } = require('mongoose').Types;
const User = require('../models/user');

const {
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_SERVER_ERROR,
  ERROR_USER_NOT_FOUND,
  ERROR_NEW_USER_PARAMS,
  ERROR_EDIT_USER_PARAMS,
  ERROR_EDIT_AVATAR_PARAMS,
  ERROR_PARAMS,
  ERROR_SERVER,
} = require('../appErrors/appErrors');

const fields = '-__v';

module.exports.getUsers = (req, res) => {
  User.find({}, fields)
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(ERROR_CODE_SERVER_ERROR).send({ message: ERROR_SERVER }));
};

module.exports.getUser = (req, res) => {
  const id = (ObjectId.isValid(req.params.userId) && (new ObjectId(req.params.userId)));
  if (!id) {
    res.status(ERROR_CODE_BAD_REQUEST).send({ message: ERROR_PARAMS });
    return;
  }

  User.findById(id, fields, { runValidators: true })
    .then((result) => {
      if (!result) {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: ERROR_USER_NOT_FOUND });
        return;
      }
      res.send({ data: result });
    })
    .catch((err) => {
      console.log(err);
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: ERROR_SERVER });
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
      if (err.name === 'ValidationError') return res.status(ERROR_CODE_BAD_REQUEST).send({ message: ERROR_NEW_USER_PARAMS });
      return res.status(ERROR_CODE_SERVER_ERROR).send({ message: ERROR_SERVER });
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
      if (!result) return res.status(ERROR_CODE_NOT_FOUND).send({ message: ERROR_USER_NOT_FOUND });
      return res.send({ data: result });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') return res.status(ERROR_CODE_BAD_REQUEST).send({ message: ERROR_EDIT_USER_PARAMS });
      return res.status(ERROR_CODE_SERVER_ERROR).send({ message: ERROR_SERVER });
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
      if (!result) return res.status(ERROR_CODE_NOT_FOUND).send({ message: ERROR_USER_NOT_FOUND });
      return res.send({ data: result });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') return res.status(ERROR_CODE_BAD_REQUEST).send({ message: ERROR_EDIT_AVATAR_PARAMS });
      return res.status(ERROR_CODE_SERVER_ERROR).send({ message: ERROR_SERVER });
    });
};
