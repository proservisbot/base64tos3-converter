const assert = require('assert');

const FIFTEEN_MINUTES_IN_MILLISECONDS = 900000;

/**
 * Class for caching SSM values
 */
module.exports = class SSMCache {
  constructor({ ssm, expiryTime = FIFTEEN_MINUTES_IN_MILLISECONDS }) {
    assert(ssm, 'ssm is required');
    this.ssm = ssm;
    this.expiryTime = expiryTime;
    this.cache = {};
  }

  /**
   * Checks if the cache contains the given SSM key, and that the
   * value is not expired
   *
   * @param {string} ssmKey the ssm key
   * @returns {boolean}
   */
  hasValidCachedValue(ssmKey) {
    return this.cache[ssmKey] && Date.now() < this.cache[ssmKey].expiresAt;
  }

  /**
   * Gets an ssm value and caches it if it is not already in the cache.
   * If the value is already in the cache then the cached value will be returned
   *
   * @param {string} ssmKey the ssm key to get
   * @param {boolean} withDecryption if the value should be decrypted
   * @param {object} logger the logger
   */
  async getSSMValue(ssmKey, withDecryption) {
    try {
      if (this.hasValidCachedValue(ssmKey)) {
        console.log(`Using cached ssm value for key ${ssmKey}`);
        return this.cache[ssmKey].value;
      }
      console.log('No value in cache, retrieving value from SSM');
      const params = { Name: ssmKey, WithDecryption: withDecryption };
      const { Parameter: { Value: value } } = await this.ssm.getParameter(params).promise();
      this.cache[ssmKey] = { value, expiresAt: Date.now() + this.expiryTime };
      return value;
    } catch (err) {
      console.error(`Failed to retrieve ${ssmKey} from SSM with code ${err.code}`);
      throw err;
    }
  }
};
