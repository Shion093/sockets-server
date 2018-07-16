const express = require('express');
const validate = require('express-validation');
const multer = require('multer');

const { login } = require('./validations');

const { loginAdmin } = require('./actions');

const router = express.Router();

router.route('/login/admin').post(validate(login), loginAdmin);

module.exports = router;
