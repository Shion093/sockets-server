const Joi = require('joi');

module.exports = {
  // POST /v1/auth/login/admin
  login : {
    body : {
      email    : Joi.string().min(6).required(),
      password : Joi.string().min(6).required(),
    },
  },
};