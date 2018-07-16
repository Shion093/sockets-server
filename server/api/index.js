const express = require('express');
const auth = require('./auth');

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));
router.use('/docs', express.static('docs'));

router.use('/auth', auth);

module.exports = router;
