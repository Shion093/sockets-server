// Promise = require('bluebird');
// const { port, env } = require('./config/constants');
// const mongoose = require('./config/mongoose');
// const app = require('./config/express');
//
// mongoose.connect();
//
//
// app.listen(port, () => console.info(`server started on port ${port} (${env})`));
//
// module.exports = app;
const path = require('path');
const { NodeMediaCluster } = require('node-media-server');
const numCPUs = require('os').cpus().length;
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_timeout: 30
  },
  http: {
    port: 8000,
    allow_origin: '*'
  },
  https: {
    port: 8443,
    key: path.join(__dirname, 'privatekey.pem'),
    cert:path.join(__dirname,'certificate.pem'),
  },
  cluster: {
    num: numCPUs
  }
};

var nmcs = new NodeMediaCluster(config)
nmcs.run();
