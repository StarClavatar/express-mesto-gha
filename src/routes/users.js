const router = require('express').Router();

const {
  getUsers,
  getUser,
  getMe,
  updateAvatar,
  updateUser,
} = require('../controllers/users');

const {
  validationMongoId,
  validationEditUser,
  validationEditAvatar,
} = require('../middlewares/validation');

router.get('/', getUsers);
router.get('/:_id', validationMongoId, getUser);
router.get('/me', getMe);
router.patch('/me', validationEditUser, updateUser);
router.patch('/me/avatar', validationEditAvatar, updateAvatar);

module.exports = router;
