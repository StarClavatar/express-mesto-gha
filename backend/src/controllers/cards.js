const Card = require('../models/card');

const Helpers = require('../utils/helpers');
const AppErrors = require('../appErrors/appErrors');
const BadRequestErr = require('../appErrors/bad-request-error');
const NotFoundErr = require('../appErrors/not-found-err');
const UserRights = require('../appErrors/user-rights');

const fields = 'name link owner likes';

module.exports.getCards = (req, res, next) => {
  Card.find({}, fields).populate('owner', 'name about').populate('likes', 'name about')
    .then((result) => res.send(result))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((result) => {
      Card.findById(result._id).populate('owner', 'name about').populate('likes', 'name about')
        .then((dat) => {
          res.send(dat);
        })
        .catch(next);
      // res.send({
      //   _id: result._id,
      //   name: result.name,
      //   link: result.link,
      //   owner: result.owner,
      //   likes: result.likes,
      //   createdAt: result.createdAt,
      // });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestErr(AppErrors.ERROR_NEW_CARD_PARAMS));
      }
      return next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const id = Helpers.getMongoId(req.params._id);
  if (!id) {
    next(new BadRequestErr(AppErrors.ERROR_PARAMS));
    return;
  }
  // ищем карточку
  Card.findOne({ _id: id }, 'owner')
    .then((result) => {
      if (!result) throw new NotFoundErr(AppErrors.ERROR_CARD_NOT_FOUND);
      // выходим с оишбкой, если карточка не принадлежит текущему пользователю
      if (result.get('owner', String) !== req.user._id) {
        throw new UserRights(AppErrors.ERROR_DELETE_CARD_NOT_OWNERED);
      }
      // удаляем карточку
      Card.findOneAndDelete({ _id: id })
        .then(() => {
          res.status(200).send({ message: 'пост удален' });
        })
        .catch(next);
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  const id = Helpers.getMongoId(req.params._id);
  if (!id) { next(new BadRequestErr(AppErrors.ERROR_PARAMS)); return; }
  Card.findByIdAndUpdate(
    id,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true, fields },
  ).populate('owner', 'name about').populate('likes', 'name about')
    .then((result) => {
      if (!result) throw new NotFoundErr(AppErrors.ERROR_CARD_NOT_FOUND);
      return res.send(result);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestErr(AppErrors.ERROR_CARD_LIKES_PARAMS));
      }
      return next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const id = Helpers.getMongoId(req.params._id);
  if (!id) { next(new BadRequestErr(AppErrors.ERROR_PARAMS)); return; }
  Card.findByIdAndUpdate(
    id,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true, fields },
  ).populate('owner', 'name about').populate('likes', 'name about')
    .then((result) => {
      if (!result) throw new NotFoundErr(AppErrors.ERROR_CARD_NOT_FOUND);
      return res.send(result);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestErr(AppErrors.ERROR_CARD_LIKES_PARAMS));
      }
      return next(err);
    });
};
