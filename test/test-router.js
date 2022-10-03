const supertest = require('supertest');
const assert = require('assert');
const sinon = require('sinon');
const Router = require('../src/api/router');

describe('Unit: Router', () => {
  let app;
  let deps;
  const API_KEY = 'api_key';

  beforeEach(() => {
    deps = {
      ssmCache: {
        getSSMValue: sinon.stub().resolves(API_KEY)
      },
      environment: {
        getApiKeySSMParameter: sinon.stub().returns('/ssm/key'),
        getFileBucket: sinon.stub().returns('bucket')
      },
      converter: {
        convertAndStore: sinon.stub().resolves('file_name')
      },
      s3: {
        getSignedUrl: sinon.stub().returns({ promise: sinon.stub().resolves('url') })
      }
    };
    const router = Router(deps);
    app = supertest(router);
  });

  it('Should return 200 on /base64tos3 when given valid parameters', async () => {
    const result = await app.post('/v1/base64tos3')
      .send({ base64: 'base64', mimeType: 'application/pdf' })
      .set('Authorization', `ApiKey ${API_KEY}`)
      .expect(200);

    assert.deepStrictEqual(result.body, { presignedUrl: 'url' });
  });

  it('Should return 500 on /base64tos3 when missing base64', async () => {
    const result = await app.post('/v1/base64tos3')
      .send({ mimeType: 'mimeType' })
      .set('Authorization', `ApiKey ${API_KEY}`)
      .expect(400);

    assert.deepStrictEqual(result.body, { error: '"base64" is required' });
  });

  it('Should return 500 on /base64tos3 when missing mimeType', async () => {
    const result = await app.post('/v1/base64tos3')
      .send({ base64: 'base64' })
      .set('Authorization', `ApiKey ${API_KEY}`)
      .expect(400);

    assert.deepStrictEqual(result.body, { error: '"mimeType" is required' });
  });
});
