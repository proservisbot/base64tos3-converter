const assert = require('assert');
const clone = require('clone');
const createDependencies = require('../src/shared/createDependencies');

describe('Unit -  Create Dependencies', () => {
  const env = clone(process.env);
  beforeEach(() => {
    process.env.API_KEY_SSM_PARAMETER = 'api_key';
    process.env.FILE_BUCKET = 'bucket';
  });

  afterEach(() => {
    process.env = env;
  });

  it('Should be possible to create dependencies', () => {
    const deps = createDependencies();
    assert.deepStrictEqual(Object.keys(deps).length, 4);
  });
});
