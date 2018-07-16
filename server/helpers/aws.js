const aws = require('aws-sdk');

const configuration = {
  AWS_REGION : process.env.AWS_REGION,
  AWS_SECRET : process.env.AWS_SECRET,
  AWS_KEY    : process.env.AWS_KEY,
};

aws.config.update({
  region          : configuration.AWS_REGION,
  accessKeyId     : configuration.AWS_KEY,
  secretAccessKey : configuration.AWS_SECRET,
});

module.exports = aws;