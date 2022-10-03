const assert = require('assert');
const sinon = require('sinon');
const checkAuthorizationLib = require('../src/api/middleware/checkAuthorization');

describe('Unit: CheckAuthorization', () => {
  it('Should call checkAuthorization and check the authorization header', (done) => {
    const ssmCache = {
      getSSMValue: sinon.stub().resolves('api_key')
    };
    const environment = {
      getApiKeySSMParameter: sinon.stub().resolves('/ssm/key')
    };
    const checkAuthorization = checkAuthorizationLib({ ssmCache, environment });
    const authorization = 'api_key';
    const organization = 'test';
    const req = { headers: { authorization: `ApiKey ${authorization}` }, params: { organization } };
    const res = {};
    const next = (error) => {
      assert(!error, 'Shouldn\'t have an error');
      done();
    };
    checkAuthorization(req, res, next);
  });

  it('Should call checkAuthorization and throw error due to invalid key', (done) => {
    const ssmCache = {
      getSSMValue: sinon.stub().resolves('api_key')
    };
    const environment = {
      getApiKeySSMParameter: sinon.stub().resolves('/ssm/key')
    };
    const checkAuthorization = checkAuthorizationLib({ ssmCache, environment });
    const authorization = 'wrong_key';
    const organization = 'test';
    const req = { headers: { authorization: `ApiKey ${authorization}` }, params: { organization } };
    const res = {};
    const next = (error) => {
      assert(error, 'Should have an error');
      assert.strictEqual(error.status, 401);
      assert.strictEqual(error.publicMessage, 'Unauthorized');
      done();
    };
    checkAuthorization(req, res, next);
  });

  it('Should call checkAuthorization and throw error due no supplied key', (done) => {
    const ssmCache = {
      getSSMValue: sinon.stub().resolves('api_key')
    };
    const environment = {
      getApiKeySSMParameter: sinon.stub().resolves('/ssm/key')
    };
    const checkAuthorization = checkAuthorizationLib({ ssmCache, environment });
    const organization = 'test';
    const req = { headers: {}, params: { organization } };
    const res = {};
    const next = (error) => {
      assert(error, 'Should have an error');
      assert.strictEqual(error.status, 401);
      assert.strictEqual(error.publicMessage, 'Unauthorized');
      done();
    };
    checkAuthorization(req, res, next);
  });
});
