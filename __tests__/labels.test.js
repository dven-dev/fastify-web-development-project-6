// @ts-check
import {
  describe, beforeAll, afterAll, it, expect,
} from '@jest/globals';
import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test labels CRUD', () => {
  let app;
  let knex;
  let models;
  let cookies;
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
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('labels'),
    });
    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newLabel'),
      cookies,
    });
    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = { name: 'Test Label' };
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      cookies,
      payload: { data: params },
    });
    expect(response.statusCode).toBe(302);
    const label = await models.label.query().findOne({ name: params.name });
    expect(label).toMatchObject(params);
  });

  it('edit', async () => {
    const label = await models.label.query().findOne({ name: 'Test Label' });
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editLabel', { id: label.id }),
      cookies,
    });
    expect(response.statusCode).toBe(200);
  });

  it('update', async () => {
    const label = await models.label.query().findOne({ name: 'Test Label' });
    const params = { name: 'Updated Label' };
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateLabel', { id: label.id }),
      cookies,
      payload: { data: params },
    });
    expect(response.statusCode).toBe(302);
    const updated = await models.label.query().findById(label.id);
    expect(updated).toMatchObject(params);
  });

  it('delete', async () => {
    const label = await models.label.query().findOne({ name: 'Updated Label' });
    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteLabel', { id: label.id }),
      cookies,
    });
    expect(response.statusCode).toBe(302);
    const deleted = await models.label.query().findById(label.id);
    expect(deleted).toBeUndefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
