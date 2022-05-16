const { ObjectId } = require('mongoose').Types;
const url = require('url');

module.exports = {
  getMongoId: (id) => ObjectId.isValid(id) && (new ObjectId(id)),
  isValidUrl: (adr) => {
    try {
      const val = new url.URL(adr);
      return val;
    } catch (err) {
      return false;
    }
  },
};
