const mongoose = require('mongoose');
const { isValidUrl } = require('../utils/helpers');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator: isValidUrl,
      message: 'Не корректная ссылка',
    },
  },
});

module.exports = mongoose.model('user', userSchema);
