const router = require('express').Router();
const {
  getCards,
  deleteCard,
  createCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const {
  validationMongoId,
  validationCreateCard,
} = require('../middlewares/validation');

router.get('/', getCards);
router.delete('/:_id', validationMongoId, deleteCard);
router.post('/', validationCreateCard, createCard);
router.put('/:_id/likes', validationMongoId, likeCard);
router.delete('/:_id/likes', validationMongoId, dislikeCard);

module.exports = router;
