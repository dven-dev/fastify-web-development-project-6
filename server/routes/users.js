// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
      return reply;
    })
    .get('/users/:id/edit', { name: 'editUser', preValidation: app.authenticate }, async (req, reply) => {
      if (req.user.id !== Number(req.params.id)) {
        req.flash('error', i18next.t('flash.accessDenied'));
        reply.redirect(app.reverse('users'));
        return reply;
      }

      const user = await app.objection.models.user.query().findById(req.params.id);
      reply.render('users/edit', { user });
      return reply;
    })
    .post('/users', async (req, reply) => {
      const user = new app.objection.models.user();
      user.$set(req.body.data);

      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(validUser);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors: data });
      }

      return reply;
    })
    .patch('/users/:id', { name: 'updateUser', preValidation: app.authenticate }, async (req, reply) => {
      if (req.user.id !== Number(req.params.id)) {
        req.flash('error', i18next.t('flash.accessDenied'));
        reply.redirect(app.reverse('users'));
        return reply;
      }

      const user = await app.objection.models.user.query().findById(req.params.id);

      try {
        await user.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.users.update.success'));
        reply.redirect(app.reverse('users'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.update.error'));
        reply.render('users/edit', { user, errors: data });
      }

      return reply;
    })
    .delete('/users/:id', { name: 'deleteUser', preValidation: app.authenticate }, async (req, reply) => {
      if (req.user.id !== Number(req.params.id)) {
        req.flash('error', i18next.t('flash.accessDenied'));
        reply.redirect(app.reverse('users'));
        return reply;
      }

      const user = await app.objection.models.user.query().findById(req.params.id);

      const tasksAsCreator = await app.objection.models.task.query().where('creator_id', user.id);
      const tasksAsExecutor = await app.objection.models.task.query().where('executor_id', user.id);

      if (tasksAsCreator.length > 0 || tasksAsExecutor.length > 0) {
        req.flash('error', i18next.t('flash.users.delete.error'));
        reply.redirect(app.reverse('users'));
        return reply;
      }

      await user.$query().delete();
      req.flash('info', i18next.t('flash.users.delete.success'));
      reply.redirect(app.reverse('users'));
      return reply;
    });
};
