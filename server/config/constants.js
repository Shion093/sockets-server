const path = require('path') ;

require('dotenv-safe').load({
  path   : path.join(__dirname, '../../.env'),
  sample : path.join(__dirname, '../../.env.example'),
});

module.exports = {
  env       : process.env.NODE_ENV,
  port      : process.env.PORT,
  logs      : process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  mongo     : {
    uri : process.env.NODE_ENV === 'test'
      ? process.env.MONGO_URI_TESTS
      : process.env.MONGO_URI,
  },
  restaurant : process.env.RESTAURANT_DOMAIN,
};