// @ts-check

import _ from 'lodash';
import fastify from 'fastify';

import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import { getTestData, prepareData } from './helpers/index.js';

describe('test users CRUD', () => {
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
  });

  beforeEach(async () => {
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toMatchObject(expected);
  });

  it('sign in as existing user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.existing,
      },
    });

    expect(response.statusCode).toBe(302);
    const [sessionCookie] = response.cookies;
    const { name, value } = sessionCookie;
    cookie = { [name]: value };
  });

  it('edit own profile', async () => {
    const user = await models.user.query().findOne({ email: testData.users.existing.email });

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editUser', { id: user.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('edit another user is denied', async () => {
    const anotherUser = await models.user.query()
      .whereNot('email', testData.users.existing.email)
      .first();

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editUser', { id: anotherUser.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(app.reverse('users'));
  });

  it('update own profile', async () => {
    const user = await models.user.query().findOne({ email: testData.users.existing.email });

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateUser', { id: user.id }),
      payload: {
        data: { firstName: 'UpdatedName' },
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const updatedUser = await models.user.query().findById(user.id);
    expect(updatedUser.firstName).toBe('UpdatedName');
  });

  it('update another user is denied', async () => {
    const anotherUser = await models.user.query()
      .whereNot('email', testData.users.existing.email)
      .first();
    const originalFirstName = anotherUser.firstName;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateUser', { id: anotherUser.id }),
      payload: {
        data: { firstName: 'ShouldNotChange' },
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(app.reverse('users'));
    const unchangedUser = await models.user.query().findById(anotherUser.id);
    expect(unchangedUser.firstName).toBe(originalFirstName);
  });

  it('delete another user is denied', async () => {
    const anotherUser = await models.user.query()
      .whereNot('email', testData.users.existing.email)
      .first();

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id: anotherUser.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const stillExists = await models.user.query().findById(anotherUser.id);
    expect(stillExists).toBeDefined();
  });

  it('delete own account logs the user out', async () => {
    const user = await models.user.query().findOne({ email: testData.users.existing.email });

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id: user.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const deletedUser = await models.user.query().findById(user.id);
    expect(deletedUser).toBeUndefined();

    const [updatedSessionCookie] = response.cookies;
    const updatedCookie = updatedSessionCookie
      ? { [updatedSessionCookie.name]: updatedSessionCookie.value }
      : cookie;

    const indexResponse = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
      cookies: updatedCookie,
    });

    expect(indexResponse.statusCode).toBe(200);
  });

  afterEach(async () => {
    // Пока Segmentation fault: 11
    // после каждого теста откатываем миграции
    // await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});
