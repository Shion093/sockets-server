const expressValidation = require('express-validation');
const APIError = require('../utils/apiError');
const { env } = require('../config/constants');

const handler = (err, req, res, next) => {
  const response = {
    code    : err.status ? err.status : 500,
    message : err.message || err.status,
    errors  : err.errors,
    stack   : err.stack,
  };

  if (env !== 'development') {
    delete response.stack;
  }

  res.status(response.code).json(response);
  res.end();
};

const converter = (err, req, res, next) => {
  let convertedError = err;
  if (err instanceof expressValidation.ValidationError) {
    convertedError = new APIError({
      message : 'Validation error',
      errors  : err.errors,
      status  : err.status,
      stack   : err.stack,
    });
  } else if (!(err instanceof APIError)) {
    convertedError = new APIError({
      message : err.message,
      status  : err.status,
      stack   : err.stack,
    });
  }

  return handler(convertedError, req, res);
};

const notFound = (req, res, next) => {
  const err = new APIError({
    message : 'Not found',
    status  : 404,
  });
  return handler(err, req, res);
};

module.exports = {
  notFound,
  converter,
  handler,
};