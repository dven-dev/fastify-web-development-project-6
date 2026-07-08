// @ts-check
import {
  describe, beforeAll, afterAll, it, expect,
} from '@jest/globals';
import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test tasks CRUD', () => {
  let app;
  let knex;
  let models;
  let cookies;
  let statusId;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;
    await knex.migrate.latest();
    await prepareData(app);

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: { data: testData.users.existing },
    });
    cookies = response.cookies.reduce((acc, c) => ({ ...acc, [c.name]: c.value }), {});
    const status = await models.taskStatus.query().insert({ name: 'Test Status' });
    statusId = String(status.id);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
    });
    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
      cookies,
    });
    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = { name: 'Test Task', statusId };
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      cookies,
      payload: { data: params },
    });
    expect(response.statusCode).toBe(302);
    const task = await models.task.query().findOne({ name: params.name });
    expect(task).toMatchObject({ name: params.name });
  });

  it('edit', async () => {
    const task = await models.task.query().findOne({ name: 'Test Task' });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editTask', { id: task.id }),
      cookies,
    });
    expect(response.statusCode).toBe(200);
  });

  it('update', async () => {
    const task = await models.task.query().findOne({ name: 'Test Task' });
    const params = { name: 'Updated Task', statusId };
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateTask', { id: task.id }),
      cookies,
      payload: { data: params },
    });
    expect(response.statusCode).toBe(302);
    const updated = await models.task.query().findById(task.id);
    expect(updated.name).toBe(params.name);
  });

  it('delete', async () => {
    const task = await models.task.query().findOne({ name: 'Updated Task' });
    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteTask', { id: task.id }),
      cookies,
    });
    expect(response.statusCode).toBe(302);
    const deleted = await models.task.query().findById(task.id);
    expect(deleted).toBeUndefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
