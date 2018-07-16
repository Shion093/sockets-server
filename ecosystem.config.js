module.exports = {
  apps : [
    {
      name           : 'bocaappapi',
      script         : './server/index.js',
      watch          : true,
      env            : {
        'PORT'     : 7777,//you can choose
        'NODE_ENV' : 'development'
      },
      env_production : {
        'PORT'     : 7777,//you can choose
        'NODE_ENV' : 'production',
      }
    }
  ]
};