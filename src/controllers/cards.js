const Card = require('../models/card');

const Helpers = require('../utils/helpers');
const AppErrors = require('../appErrors/appErrors');

const fields = 'name link owner likes';

module.exports.getCards = (req, res) => {
  Card.find({}, fields).populate('owner', 'name about').populate('likes', 'name about')
    .then((result) => res.send({ data: result }))
    .catch(() => res
      .status(AppErrors.ERROR_CODE_SERVER_ERROR)
      .send({ message: AppErrors.ERROR_SERVER }));
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
      if (err.name === 'ValidationError') {
        return res
          .status(AppErrors.ERROR_CODE_BAD_REQUEST)
          .send({ message: AppErrors.ERROR_NEW_CARD_PARAMS });
      }
      return res
        .status(AppErrors.ERROR_CODE_SERVER_ERROR)
        .send({ message: AppErrors.ERROR_SERVER });
    });
};

module.exports.deleteCard = (req, res) => {
  const id = Helpers.getMongoId(req.params.cardId);
  if (!id) {
    res.status(AppErrors.ERROR_CODE_BAD_REQUEST).send({ message: AppErrors.ERROR_PARAMS });
    return;
  }

  Card.findOneAndDelete({ _id: id })
    .then((result) => {
      if (!result) {
        res
          .status(AppErrors.ERROR_CODE_NOT_FOUND)
          .send({ message: AppErrors.ERROR_CARD_NOT_FOUND });
        return;
      }
      Card.find({}, fields).populate('owner', 'name about').populate('likes', 'name about')
        // в ответе может быть owner: null,
        // из-за захардкоженного _id пользователя в app.js, согласно заданию 13
        .then((cards) => res.send({ data: cards }))
        .catch(() => res
          .status(AppErrors.ERROR_CODE_SERVER_ERROR)
          .send({ message: AppErrors.ERROR_SERVER }));
    })
    .catch(() => res
      .status(AppErrors.ERROR_CODE_SERVER_ERROR)
      .send({ message: AppErrors.ERROR_SERVER }));
};

module.exports.likeCard = (req, res) => {
  const id = Helpers.getMongoId(req.params.cardId);
  if (!id) {
    res
      .status(AppErrors.ERROR_CODE_BAD_REQUEST)
      .send({ message: AppErrors.ERROR_PARAMS });
    return;
  }

  Card.findByIdAndUpdate(
    id,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true, fields },
  )
    .then((result) => {
      if (!result) {
        return res
          .status(AppErrors.ERROR_CODE_NOT_FOUND)
          .send({ message: AppErrors.ERROR_CARD_NOT_FOUND });
      }
      return res.send({ data: result });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res
          .status(AppErrors.ERROR_CODE_BAD_REQUEST)
          .send({ message: AppErrors.ERROR_CARD_LIKES_PARAMS });
      }
      return res
        .status(AppErrors.ERROR_CODE_SERVER_ERROR)
        .send({ message: AppErrors.ERROR_SERVER });
    });
};

module.exports.dislikeCard = (req, res) => {
  const id = Helpers.getMongoId(req.params.cardId);
  if (!id) {
    res
      .status(AppErrors.ERROR_CODE_BAD_REQUEST)
      .send({ message: AppErrors.ERROR_PARAMS });
    return;
  }

  Card.findByIdAndUpdate(
    id,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true, fields },
  )
    .then((result) => {
      if (!result) {
        return res
          .status(AppErrors.ERROR_CODE_NOT_FOUND)
          .send({ message: AppErrors.ERROR_CARD_NOT_FOUND });
      }
      return res.send({ data: result });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res
          .status(AppErrors.ERROR_CODE_BAD_REQUEST)
          .send({ message: AppErrors.ERROR_CARD_LIKES_PARAMS });
      }
      return res
        .status(AppErrors.ERROR_CODE_SERVER_ERROR)
        .send({ message: AppErrors.ERROR_SERVER });
    });
};
