module.exports = ({ environment, ssmCache }) => async (req, res, next) => {
  const apiKey = await ssmCache.getSSMValue(environment.getApiKeySSMParameter(), true, this.logger);
  const { headers: { authorization } } = req;

  if (authorization) {
    const suppliedKey = authorization.replace('ApiKey ', '');
    if (apiKey === suppliedKey) {
      return next();
    }
  }

  const error = new Error('Unauthorized');
  error.status = 401;
  error.publicMessage = 'Unauthorized';
  return next(error);
};
