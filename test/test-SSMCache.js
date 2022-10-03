const assert = require('assert');
const sinon = require('sinon');
const AWS = require('aws-sdk');
const SSMCache = require('../src/shared/ssm/SSMCache');

describe('Unit: SSMCache', () => {
  let logger;

  beforeEach(() => {
    logger = {
      info: sinon.stub().returns(),
      error: sinon.stub().returns()
    };
  });

  it('should get value from ssm if it is not cached', async () => {
    const ssm = new AWS.SSM();
    const value = 'some value';
    const getParameterStub = sinon.stub(ssm, 'getParameter')
      .returns({ promise: async () => ({ Parameter: { Value: value } }) });

    const ssmCache = new SSMCache({ ssm });

    const retrievedValue = await ssmCache.getSSMValue('ssmKey', true, logger);

    assert.strictEqual(retrievedValue, value);

    sinon.assert.calledWithExactly(getParameterStub, { Name: 'ssmKey', WithDecryption: true });
  });

  it('should get value from cache ssm if it is available in the cache', async () => {
    const ssm = new AWS.SSM();
    const value = 'some value';
    const getParameterStub = sinon.stub(ssm, 'getParameter')
      .returns({ promise: async () => ({ Parameter: { Value: value } }) });

    const ssmCache = new SSMCache({ ssm });

    const retrievedValueFromSSM = await ssmCache.getSSMValue('ssmKey', true, logger);
    const retrievedValueFromCache = await ssmCache.getSSMValue('ssmKey', true, logger);

    assert.strictEqual(retrievedValueFromCache, value);
    assert.strictEqual(retrievedValueFromSSM, value);

    sinon.assert.calledOnceWithExactly(getParameterStub, { Name: 'ssmKey', WithDecryption: true });
  });

  it('should get get value from ssm if the cached entry is expired', async () => {
    const ssm = new AWS.SSM();
    const value = 'some value';

    const getParameterStub = sinon.stub(ssm, 'getParameter')
      .returns({ promise: async () => ({ Parameter: { Value: value } }) });

    const ssmCache = new SSMCache({ ssm, expiryTime: 0 });

    await ssmCache.getSSMValue('ssmKey', true, logger);
    await ssmCache.getSSMValue('ssmKey', true, logger);

    sinon.assert.calledTwice(getParameterStub);
    sinon.assert.calledWith(getParameterStub, { Name: 'ssmKey', WithDecryption: true });
  });

  it('should throw log and throw an error if an error occurs retrieving an item from the cache', async () => {
    const ssm = new AWS.SSM();

    sinon.stub(ssm, 'getParameter').throws(new Error('failed to get parameter'));

    const ssmCache = new SSMCache({ ssm, expiryTime: 0 });

    await assert.rejects(async () => {
      await ssmCache.getSSMValue('ssmKey', true, logger);
    });
  });
});
