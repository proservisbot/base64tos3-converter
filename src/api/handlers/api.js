const serverlessHttp = require('serverless-http');
const Router = require('../router');
const createDependencies = require('../../shared/createDependencies');

module.exports.handler = async (event) => {
  const dependencies = createDependencies();
  const router = Router(dependencies);
  const server = serverlessHttp(router);
  return server(event);
};
