const Express = require('express');
const Joi = require('joi');
const checkAuthorizationMiddleware = require('./middleware/checkAuthorization');

module.exports = (dependencies) => {
  const app = Express();
  app.use(Express.json());
  app.disable('x-powered-by');

  const checkAuth = checkAuthorizationMiddleware(dependencies);

  app.post('/v1/base64tos3', [checkAuth], async (req, res, next) => {
    const { converter, s3, environment } = dependencies;
    const { base64, mimeType } = req.body;

    const SCHEMA = Joi.object().keys({
      base64: Joi.string().required(),
      mimeType: Joi.string().required()
    });

    const validationResult = SCHEMA.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      return next(new Error(validationResult.error.message));
    }

    const fileName = await converter.convertAndStore(base64, mimeType);

    const url = await s3.getSignedUrl('getObject', {
      Bucket: environment.getFileBucket(),
      Key: fileName,
      Expires: 300
    });

    return res.json({ presignedUrl: url });
  });

  // eslint-disable-next-line no-unused-vars
  app.use(async (err, req, res, next) => {
    const status = err.status ? err.status : 500;
    const message = err.publicMessage ? err.publicMessage : err.message;
    res.status(status).json({
      error: message
    });
  });

  return app;
};
