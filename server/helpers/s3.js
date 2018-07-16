const aws = require('./aws');

const S3 = new aws.S3();

function uploadS3 ({ bucket, fileName, data, contentType = 'image/jpeg' }) {
  return new Promise((resolve, reject) => {
    S3.upload({
      Bucket          : bucket,
      Key             : fileName,
      Body            : data,
      ACL             : 'public-read',
      ContentEncoding : 'base64',
      ContentType     : contentType,
    }, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}

module.exports = uploadS3;