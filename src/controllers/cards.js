const { ObjectId } = require('mongoose').Types;
const Card = require('../models/card');

const {
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_SERVER_ERROR,
  ERROR_CARD_NOT_FOUND,
  ERROR_NEW_CARD_PARAMS,
  ERROR_CARD_LIKES_PARAMS,
  ERROR_PARAMS,
  ERROR_SERVER,
} = require('../appErrors/appErrors');

const fields = 'name link owner likes';

module.exports.getCards = (req, res) => {
  Card.find({}, fields).populate('owner', 'name about').populate('likes', 'name about')
    .then((result) => res.send({ data: result }))
    .catch(() => res.status(ERROR_CODE_SERVER_ERROR).send({ message: ERROR_SERVER }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((result) => {
      res.send({
        data: {
          _id: result._id, name, link, likes: result.likes, createdAt: result.createdAt,
        },
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') return res.status(ERROR_CODE_BAD_REQUEST).send({ message: ERROR_NEW_CARD_PARAMS });
      return res.status(ERROR_CODE_SERVER_ERROR).send({ message: ERROR_SERVER });
    });
};

module.exports.deleteCard = (req, res) => {
  const id = (ObjectId.isValid(req.params.cardId) && (new ObjectId(req.params.cardId)));
  if (!id) {
    res.status(ERROR_CODE_BAD_REQUEST).send({ message: ERROR_PARAMS });
    return;
  }

  Card.findOneAndDelete({ _id: id })
    .then((result) => {
      if (!result) {
        res.status(ERROR_CODE_NOT_FOUND).send({ message: ERROR_CARD_NOT_FOUND });
        return;
      }
      Card.find({}, fields).populate('owner', 'name about').populate('likes', 'name about')
        .then((fres) => res.send({ data: fres }))
        .catch(() => res.status(ERROR_CODE_SERVER_ERROR).send({ message: ERROR_SERVER }));
    })
    .catch(() => res.status(ERROR_CODE_SERVER_ERROR).send({ message: ERROR_SERVER }));
};

module.exports.likeCard = (req, res) => {
  const id = (ObjectId.isValid(req.params.cardId) && (new ObjectId(req.params.cardId)));
  if (!id) {
    res.status(ERROR_CODE_BAD_REQUEST).send({ message: ERROR_PARAMS });
    return;
  }

  Card.findByIdAndUpdate(
    id,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true, fields },
  )
    .then((result) => {
      if (!result) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: ERROR_CARD_NOT_FOUND });
      }
      return res.send({ data: result });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') return res.status(ERROR_CODE_BAD_REQUEST).send({ message: ERROR_CARD_LIKES_PARAMS });
      return res.status(ERROR_CODE_SERVER_ERROR).send({ message: ERROR_SERVER });
    });
};

module.exports.dislikeCard = (req, res) => {
  const id = (ObjectId.isValid(req.params.cardId) && (new ObjectId(req.params.cardId)));
  if (!id) {
    res.status(ERROR_CODE_BAD_REQUEST).send({ message: ERROR_PARAMS });
    return;
  }

  Card.findByIdAndUpdate(
    id,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true, fields },
  )
    .then((result) => {
      if (!result) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: ERROR_CARD_NOT_FOUND });
      }
      return res.send({ data: result });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') return res.status(ERROR_CODE_BAD_REQUEST).send({ message: ERROR_CARD_LIKES_PARAMS });
      return res.status(ERROR_CODE_SERVER_ERROR).send({ message: ERROR_SERVER });
    });
};
