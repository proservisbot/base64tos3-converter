const AWS = require('aws-sdk');
const sharp = require('sharp');
const SSMCache = require('./ssm/SSMCache');
const Environment = require('./Environment');
const Converter = require('../api/converter');

let ssmCache;

module.exports = () => {
  const environment = new Environment(process.env);
  const s3 = new AWS.S3();
  const ssm = new AWS.SSM();
  const converter = new Converter({ sharp, s3, environment });
  if (!ssmCache) {
    ssmCache = new SSMCache({ ssm });
  }

  return {
    converter,
    s3,
    environment,
    ssmCache
  };
};
