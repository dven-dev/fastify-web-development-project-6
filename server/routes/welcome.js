// @ts-check
export default (app) => {
  app
    .get('/', { name: 'root' }, (req, reply) => {
      reply.render('welcome/index');
    })
    .get('/test-rollbar', async (req, reply) => {
      throw new Error('Test Rollbar error');
    })
    .get('/protected', { name: 'protected', preValidation: app.authenticate }, (req, reply) => {
      reply.render('welcome/index');
    });
};
