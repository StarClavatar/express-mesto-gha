const Card = require('../models/card');

const Helpers = require('../utils/helpers');
const AppErrors = require('../appErrors/appErrors');
const BadRequestErr = require('../appErrors/bad-request-error');
const NotFoundErr = require('../appErrors/not-found-err');

const fields = 'name link owner likes';

module.exports.getCards = (req, res, next) => {
  Card.find({}, fields).populate('owner', 'name about').populate('likes', 'name about')
    .then((result) => res.send({ data: result }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
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
        return next(new BadRequestErr(AppErrors.ERROR_NEW_CARD_PARAMS));
      }
      return next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const id = Helpers.getMongoId(req.params.cardId);
  if (!id) {
    next(new BadRequestErr(AppErrors.ERROR_PARAMS));
    return;
  }
  // удаляем только карточку, которой мы владеем
  Card.findOneAndDelete({ _id: id, owner: req.user._id })
    .then((result) => {
      if (!result) {
        throw new NotFoundErr(AppErrors.ERROR_CARD_NOT_FOUND);
      }
      Card.find({}, fields).populate('owner', 'name about').populate('likes', 'name about')
        .then((cards) => res.send({ data: cards }))
        .catch(next);
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  const id = Helpers.getMongoId(req.params.cardId);
  if (!id) { next(new BadRequestErr(AppErrors.ERROR_PARAMS)); return; }
  Card.findByIdAndUpdate(
    id,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true, fields },
  )
    .then((result) => {
      if (!result) throw new NotFoundErr(AppErrors.ERROR_CARD_NOT_FOUND);
      return res.send({ data: result });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestErr(AppErrors.ERROR_CARD_LIKES_PARAMS));
      }
      return next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const id = Helpers.getMongoId(req.params.cardId);
  if (!id) { next(new BadRequestErr(AppErrors.ERROR_PARAMS)); return; }
  Card.findByIdAndUpdate(
    id,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true, fields },
  )
    .then((result) => {
      if (!result) throw new NotFoundErr(AppErrors.ERROR_CARD_NOT_FOUND);
      return res.send({ data: result });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestErr(AppErrors.ERROR_CARD_LIKES_PARAMS));
      }
      return next(err);
    });
};
