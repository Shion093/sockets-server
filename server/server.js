Promise = require('bluebird');
const { port, env } = require('./config/constants');
const mongoose = require('./config/mongoose');
const app = require('./config/express');

mongoose.connect();


app.listen(port, () => console.info(`server started on port ${port} (${env})`));

module.exports = app;
