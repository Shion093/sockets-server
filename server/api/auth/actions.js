const shortid = require('shortid');
const _ = require('lodash');
const { handler : errorHandler } = require('../../middlewares/errors');

async function loginAdmin (req, res, next) {
  try {
    return res.status(403).json({ error : 'Unauthorized' });
  } catch (err) {
    return errorHandler(err, req, res);
  }
}


module.exports = {
  loginAdmin,
};
