// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const filter = req.query.filter || {};
      let query = app.objection.models.task.query()
        .withGraphJoined('[status, creator, executor, labels]');

      if (filter.status) {
        query = query.where('tasks.status_id', filter.status);
      }
      if (filter.executor) {
        query = query.where('tasks.executor_id', filter.executor);
      }
      if (filter.label) {
        query = query.whereExists(
          app.objection.models.task.relatedQuery('labels').where('labels.id', filter.label),
        );
      }
      if (filter.isCreatorUser && req.user) {
        query = query.where('tasks.creator_id', req.user.id);
      }

      const tasks = await query;
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      reply.render('tasks/index', {
        tasks, users, statuses, labels, filter,
      });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (
      req,
      reply,
    ) => {
      const task = new app.objection.models.task();
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      reply.render('tasks/new', {
        task, users, statuses, labels,
      });
      return reply;
    })
    .get('/tasks/:id', { name: 'task' }, async (req, reply) => {
      const task = await app.objection.models.task.query()
        .findById(req.params.id)
        .withGraphJoined('[status, creator, executor, labels]');
      reply.render('tasks/show', { task });
      return reply;
    })
    .get('/tasks/:id/edit', { name: 'editTask', preValidation: app.authenticate }, async (
      req,
      reply,
    ) => {
      const task = await app.objection.models.task.query()
        .findById(req.params.id)
        .withGraphJoined('labels');
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      reply.render('tasks/edit', {
        task, users, statuses, labels,
      });
      return reply;
    })
    .post('/tasks', { preValidation: app.authenticate }, async (req, reply) => {
      const task = new app.objection.models.task();
      task.$set(req.body.data);
      const { labelIds: rawLabelIds, ...taskData } = req.body.data;
      const labelIds = [rawLabelIds].flat().filter(Boolean).map(Number);

      try {
        const validTask = await app.objection.models.task.fromJson({
          ...taskData,
          statusId: taskData.statusId ? parseInt(taskData.statusId, 10) : undefined,
          executorId: taskData.executorId ? parseInt(taskData.executorId, 10) : undefined,
          creatorId: req.user.id,
        });
        const insertedTask = await app.objection.models.task.query().insert(validTask);
        if (labelIds.length > 0) {
          await insertedTask.$relatedQuery('labels').relate(labelIds);
        }
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (err) {
        const users = await app.objection.models.user.query();
        const statuses = await app.objection.models.taskStatus.query();
        const labels = await app.objection.models.label.query();
        req.flash('error', `${i18next.t('flash.tasks.create.error')}: ${err.message}`);
        reply.render('tasks/new', {
          task, users, statuses, labels, errors: err.data,
        });
      }

      return reply;
    })
    .patch('/tasks/:id', { name: 'updateTask', preValidation: app.authenticate }, async (
      req,
      reply,
    ) => {
      const task = await app.objection.models.task.query().findById(req.params.id);
      const { labelIds: rawLabelIds, ...taskData } = req.body.data;
      const labelIds = [rawLabelIds].flat().filter(Boolean).map(Number);

      try {
        await task.$query().patch({
          ...taskData,
          statusId: taskData.statusId ? parseInt(taskData.statusId, 10) : undefined,
          executorId: taskData.executorId ? parseInt(taskData.executorId, 10) : undefined,
        });
        await task.$relatedQuery('labels').unrelate();
        if (labelIds.length > 0) {
          await task.$relatedQuery('labels').relate(labelIds);
        }
        req.flash('info', i18next.t('flash.tasks.update.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (err) {
        const users = await app.objection.models.user.query();
        const statuses = await app.objection.models.taskStatus.query();
        const labels = await app.objection.models.label.query();
        req.flash('error', `${i18next.t('flash.tasks.update.error')}: ${err.message}`);
        reply.render('tasks/edit', {
          task, users, statuses, labels, errors: err.data,
        });
      }

      return reply;
    })
    .delete('/tasks/:id', { name: 'deleteTask', preValidation: app.authenticate }, async (
      req,
      reply,
    ) => {
      const task = await app.objection.models.task.query().findById(req.params.id);

      if (task.creatorId !== req.user.id) {
        req.flash('error', i18next.t('flash.tasks.delete.error'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }

      await task.$relatedQuery('labels').unrelate();
      await task.$query().delete();
      req.flash('info', i18next.t('flash.tasks.delete.success'));
      reply.redirect(app.reverse('tasks'));
      return reply;
    });
};
