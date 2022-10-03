const assert = require('assert');

module.exports = class Environment {
  constructor({
    API_KEY_SSM_PARAMETER, FILE_BUCKET
  }) {
    assert(API_KEY_SSM_PARAMETER, 'API_KEY_SSM_PARAMETER is required');
    assert(FILE_BUCKET, 'FILE_BUCKET is required');
    this.API_KEY_SSM_PARAMETER = API_KEY_SSM_PARAMETER;
    this.FILE_BUCKET = FILE_BUCKET;
  }

  getApiKeySSMParameter() {
    return this.API_KEY_SSM_PARAMETER;
  }

  getFileBucket() {
    return this.FILE_BUCKET;
  }
};
