// @ts-check
import {
  describe, beforeAll, afterAll, it, expect,
} from '@jest/globals';
import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  let cookie;
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
    const [sessionCookie] = response.cookies;
    const { name, value } = sessionCookie;
    cookie = { [name]: value };
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
    });
    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = { name: 'Test Status' };
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('statuses'),
      cookies: cookie,
      payload: { data: params },
    });
    expect(response.statusCode).toBe(302);
    const status = await models.taskStatus.query().findOne({ name: params.name });
    expect(status).toMatchObject(params);
  });

  it('edit', async () => {
    const status = await models.taskStatus.query().findOne({ name: 'Test Status' });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editStatus', { id: status.id }),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('update', async () => {
    const status = await models.taskStatus.query().findOne({ name: 'Test Status' });
    const params = { name: 'Updated Status' };
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateStatus', { id: status.id }),
      cookies: cookie,
      payload: { data: params },
    });
    expect(response.statusCode).toBe(302);
    const updated = await models.taskStatus.query().findById(status.id);
    expect(updated).toMatchObject(params);
  });

  it('delete', async () => {
    const status = await models.taskStatus.query().findOne({ name: 'Updated Status' });
    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteStatus', { id: status.id }),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(302);
    const deleted = await models.taskStatus.query().findById(status.id);
    expect(deleted).toBeUndefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
