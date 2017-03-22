import test from 'tape';
import supertest from 'supertest';
import enableDestroy from 'server-destroy';

import isArray from 'lodash/isArray';

import { cleanDb } from './clean-db';

export function appsTests() {
  let agent;
  let server;

  test('setup', t => cleanDb()
    .then(() => require('../server').default)
    .then(app => {
      // server = app.server;
      server = app.server;
      enableDestroy(server);
      agent = supertest(server.listen());
    })
    .then(() => t.end()),
  );

  test('Apps: Creates an app', t => {
    t.plan(10);

    const matchData = {
      id: /\S+/,
      name: 'My app',
      description: 'My description',
      version: '1.0.0',
      updatedAt: null,
    };

    agent
      .post('/api/v2/apps')
      .send({
        name: 'My app',
        description: 'My description',
        version: '1.0.0',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        t.ok(res.body.data, 'Response contains created app data');
        const data = res.body.data;
        // assert.match(data, matchData);
        t.ok(data.id, 'App id was assigned');
        t.equal(data.name, matchData.name, 'Name is correctly saved');
        t.equal(data.version, matchData.version, 'Version is correctly saved');
        t.equal(data.updatedAt, null, 'Updated at is defined but is null');
        t.ok(data.createdAt, 'CreatedAt data is defined');
        return data.id;
      })
      .then(appId => agent
        .get(`/api/v2/apps/${appId}`)
        .timeout({ response: 5000 })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          const app = response.body.data;
          t.equal(app.id, appId, 'App id is present');
          t.equal(app.description, matchData.description, 'Description is present');
          t.same(app.triggers, [], 'Triggers is present and empty');
          t.same(app.actions, [], 'Actions is present and empty');
        }))
      .then(() => t.end());
  });

  test('Apps: Updates an app', t => {
    t.plan(5);

    agent
      .post('/api/v2/apps')
      .send({
        name: 'Update my name',
        description: 'Update my description',
        version: '0.1.0',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const body = res.body;
        t.ok(body.data, 'App was created');
        t.notOk(body.data.updatedAt, 'Updated date is not set');
        const appId = body.data.id;
        return agent.patch(`/api/v2/apps/${appId}`)
          .send({
            name: 'My name was updated',
            description: 'My description was updated',
            version: '0.2.0',
          })
          .timeout({ response: 5000 })
          .expect('Content-Type', /json/)
          .expect(200);
      })
      .then(({ body }) => {
        const data = body.data;
        t.equal(data.name, 'My name was updated', 'Name is correctly updated');
        t.equal(data.description, 'My description was updated', 'Description is correctly updated');
        t.equal(data.version, '0.2.0', 'Version is correctly updated');
      })
      .then(() => t.end());
  });

  test('Apps: Can filter by exact name', t => {
    t.plan(4);

    agent
      .post('/api/v2/apps')
      .send({ name: 'Filter me' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const body = res.body;
        t.ok(body.data, 'App was created');
        const appId = body.data.id;
        return agent.get('/api/v2/apps')
          .query({ 'filter[name]': 'fIlTER mE' })
          .timeout(5000)
          .expect('Content-Type', /json/)
          .expect(200)
          .catch(err => t.end(err))
          .then(response => {
            const data = response.body.data;
            t.ok(isArray(data), 'Result is a collection');
            t.same(data.length, 1, 'Only one result');
            t.same(data[0].id, appId, 'App was correctly filtered');
          });
      })
      .catch(err => t.done(err))
      .then(() => t.end());

  });

  test('Apps: Deletes an app', t => {
    t.plan(3);

    agent
      .post('/api/v2/apps')
      .send({ name: 'Delete me' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const body = res.body;
        t.ok(body.data, 'App was created');
        const appId = body.data.id;
        return agent.delete(`/api/v2/apps/${appId}`)
          .timeout({ response: 5000 })
          .expect(204)
          .catch(err => t.end(err))
          .then((response) => {
            t.same(response.status, 204, 'App was deleted');
            return agent.get(`/api/v2/apps/${appId}`)
              .timeout({ response: 5000 })
              .expect('Content-Type', /json/)
              .expect(404)
              .catch(err => t.end(err))
              .then(response => t.same(response.status, 404, 'App is not found anymore'));
          });
      })
      .catch(err => t.done(err))
      .then(() => t.end());
  });

  test('Apps: Name should be unique', t => {
    const appName = 'Cool app';

    const postAppAndExpectName = (expectName, message) => agent
      .post('/api/v2/apps')
      .send({ name: appName })
      .expect(200)
      .timeout(500)
      .then(({ body }) => t.equal(body.data.name, expectName, message));

    t.plan(3);
    postAppAndExpectName('Cool app', 'When there\'s no name collision name is saved as provided')
      .then(() => postAppAndExpectName('Cool app (1)', 'Name collision is automatically resolved for the first time'))
      .then(() => postAppAndExpectName('Cool app (2)', 'Name collision is automatically resolved subsequently'))
      .catch(err => t.end(err))
      .then(() => t.end());
  });

  test('Apps: Not editable fields are ignored when creating and updating', t => {
    t.plan(10);
    agent
      .post('/api/v2/apps')
      .send({
        name: 'Test non editable',
        description: 'My description',
        version: '1.0.0',

        id: 'fakeId',
        createdAt: 'fakeCreatedAt',
        updatedAt: 'fakeUpdatedAt',
        actions: [{ myFakeAction: true }],
        triggers: [{ myFakeTrigger: true }],
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(({ body }) => {
        const data = body.data;
        t.notSame(data.id, 'fakeId', 'Attempt to set id was ignored on creation');
        t.notSame(data.createdAt, 'fakeCreatedAt', 'Attempt to set createdAt was ignored on creation');
        t.notSame(data.updatedAt, 'fakeUpdatedAt', 'Attempt to set updatedAt was ignored on creation');
        t.notSame(data.actions, [{ myFakeAction: true }], 'Attempt to set actions was ignored on creation');
        t.notSame(data.triggers, [{ myFakeTrigger: true }], 'Attempt to set triggers was ignored on creation');
        return data;
      })
      .then(prevResponse => agent
          .patch(`/api/v2/apps/${prevResponse.id}`)
          .send({
            id: 'fakeId2',
            createdAt: 'fakeCreatedAt2',
            updatedAt: 'fakeUpdatedAt2',
            actions: 'fakeActions2',
            triggers: 'fakeTriggers2',
          })
          .expect(200)
          .then(({ body }) => {
            const data = body.data;
            t.same(data.id, prevResponse.id, 'Attempt to set id was ignored on update');
            t.same(data.createdAt, prevResponse.createdAt, 'Attempt to set createdAt was ignored on update');
            t.notSame(data.updatedAt, 'fakeUpdatedAt2', 'Attempt to set updatedAt was ignored on update');
            t.same(data.actions, prevResponse.actions, 'Attempt to set actions was ignored on update');
            t.same(data.triggers, prevResponse.triggers, 'Attempt to set triggers was ignored on update');
          }),
      )
      .catch(err => t.end(err))
      .then(() => {
        t.end();
      });
  });

  test('teardown', t => {
    server.destroy();
    t.end();
  });
}
