import path from 'path';
import enableDestroy from 'server-destroy'; // eslint-disable-line import/no-extraneous-dependencies
import chai from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import chaiHttp from 'chai-http'; // eslint-disable-line import/no-extraneous-dependencies

process.env.FLOGO_WEB_DISABLE_WS = process.env.FLOGO_WEB_DISABLE_WS || true;
process.env.FLOGO_WEB_DBDIR = process.env.FLOGO_WEB_DBDIR || path.resolve('../dist/local/test_db');
process.env.FLOGO_WEB_LOGLEVEL = process.env.FLOGO_WEB_LOGLEVEL || 'error';

import { cleanDb } from './clean-db';

const expect = chai.expect;
chai.use(chaiHttp);
chai.config.includeStack = true;

describe('Actions:', function () {
  let server;
  let agent;
  let app;
  let contribTriggersDb = require('../config/app-config').triggersDBService.db;

  before(() => {
    // When it needs to create an engine it can take really long
    // so setting up timeout to 10 minutes
    this.timeout(600000);
    return cleanDb()
      .then(() => require('../server').default)
      .then(flogoApp => {
        // server = app.server;
        server = flogoApp.server;
        enableDestroy(server);
        agent = chai.request(server.listen());
      });
  });

  // create test app to save the actions into
  beforeEach(() => agent
      .post('/api/v2/apps')
      .send({ name: 'Test app' })
      .then(response => {
        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('object');
        app = response.body.data;
      }));

  // delete the test app
  afterEach(() => agent
      .delete(`/api/v2/apps/${app.id}`)
      .then(response => {
        expect(response, 'App deleted').to.have.status(204);
        app = null;
      }));

  it('Should create action in an app', () => {
    const matchData = {
      id: /\S+/,
      name: 'My action',
      description: 'My description',
      data: { flow: { rootTask: { id: 1, activityRef: '' } } },
      updatedAt: null,
    };

    return agent.post(`/api/v2/apps/${app.id}/actions`)
      .send({
        name: 'My action',
        description: 'My description',
        data: { flow: { rootTask: { id: 1, activityRef: '' } } },
      }).then(res => {
        expect(res, `POST /apps/${app.id}/actions`).to.have.status(200);
        expect(res.body.data).to.be.an('object');
        const data = res.body.data;
        expect(data.id).to.exist;
        expect(data.appId).to.equal(app.id);
        expect(data.name).to.equal(matchData.name);
        expect(data.data).to.deep.equal(matchData.data);
        expect(data.updatedAt).to.be.null;
        expect(data.createdAt).to.exist;
        return data.id;
      })
      .then(actionId => agent
        .get(`/api/v2/actions/${actionId}`)
        .then(response => {
          expect(response, `GET /actions/${actionId}`).to.have.status(200);
          const action = response.body.data;
          expect(action.id).to.equal(actionId);
          expect(action.appId).to.equal(app.id);
          expect(action.description).to.equal(matchData.description);
          expect(action.data).to.deep.equal(matchData.data);
        }));
  });

  it('Should update an action', () =>
    agent
          .post(`/api/v2/apps/${app.id}/actions`)
          .send({
            name: 'Update my name',
            description: 'Update my description',
        data: { },
      })
    .then(res => {
      expect(res).to.have.status(200);
      const body = res.body;
      expect(res.body.data).to.exist;
      expect(body.data.updatedAt).to.be.null;
      const actionId = body.data.id;
      return agent.patch(`/api/v2/actions/${actionId}`)
        .send({
          name: 'My name was updated',
          description: 'My description was updated',
          data: { flow: { rootTask: { id: 1, activityRef: '' } } },
        });
    })
    .then(req => {
      expect(req).to.have.status(200);
      const data = req.body.data;
      expect(data.name).to.equal('My name was updated');
      expect(data.description).to.equal('My description was updated');
      expect(data.data).to.deep.equal({ flow: { rootTask: { id: 1, activityRef: '' } } });
      expect(data.updatedAt).to.exist;
    }),
  );

  it('Should delete an action', () => agent
    .post(`/api/v2/apps/${app.id}/actions`)
      .send({ name: 'Delete me' })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an('object');
        const body = res.body;
        const actionId = body.data.id;
        return agent.delete(`/api/v2/actions/${actionId}`)
          .then(delResponse => {
            expect(delResponse).to.have.status(204);
            return agent.get(`/api/v2/actions/${actionId}`)
              .catch(err => {
                if (err.response) {
                  return Promise.resolve(err.response);
                }
                return Promise.reject(err);
              })
              .then(response => expect(response).to.have.status(404));
          });
      }),
  );

  it('Name should be unique', () => {
    const actionName = 'Cool action';

    const postActionAndExpectName = expectName => agent
      .post(`/api/v2/apps/${app.id}/actions`)
      .send({ name: actionName })
      .then(response => {
        expect(response).to.have.status(200);
        expect(response.body.data.name).to.equal(expectName);
      });

    return postActionAndExpectName('Cool action', 'When there\'s no name collision name is saved as provided')
      .then(() => postActionAndExpectName('Cool action (1)', 'Name collision is automatically resolved for the first time'))
      .then(() => postActionAndExpectName('Cool action (2)', 'Name collision is automatically resolved subsequently'));
  });

  // todo: on update name not unique should throw error

  it('Should ignore non editable fields when creating and updating', () => agent
    .post(`/api/v2/apps/${app.id}/actions`)
    .send({
      name: 'Test non editable',
      description: 'My description',

      data: { a: 1, b: 2 },

      id: 'fakeId',
      createdAt: 'fakeCreatedAt',
      updatedAt: 'fakeUpdatedAt',
      unknown: 'unknown',
    })
    .then(res => {
      expect(res).to.have.status(200);
      const data = res.body.data;
      expect(data.id).to.not.equal('fakeId');
      expect(data.createdAt).to.not.equal('fakeCreatedAt');
      expect(data.updatedAt).to.not.equal('fakeUpdatedAt');
      expect(data.data).to.deep.equal({});
      expect(data.unknown).to.not.exist;
      return data;
    })
    .then(prevResponse => agent
      .patch(`/api/v2/actions/${prevResponse.id}`)
      .send({
        id: 'fakeId2',
        createdAt: 'fakeCreatedAt2',
        updatedAt: 'fakeUpdatedAt2',
        data: { z: 2 },
        unknown: 'unknown',
      })
      .then(res => {
        expect(res).to.have.status(200);
        const data = res.body.data;
        expect(data.id).to.equal(prevResponse.id);
        expect(data.createdAt).to.equal(prevResponse.createdAt);
        expect(data.updatedAt).to.not.equal('fakeUpdatedAt2');
        expect(data.data).to.deep.equal({});
        expect(data.unknown).to.not.exist;
      }),
    ),
  );

  it('Should include the related app, triggers and handlers information', () => {
    return prepare()
      .then(({ action, trigger, handler }) =>
          agent.get(`/api/v2/actions/${action.id}`)
            .then(response => {
              expect(response).to.have.status(200);
              const data = response.body.data;
              expect(data.id).to.equal(action.id);
              expect(data.trigger).to.be.an('object').and.to.have.deep.property('id', trigger.id);
              expect(data.handler).to.be.an('object').and.to.have.deep.property('actionId', handler.actionId);
              expect(data.app).to.be.an('object').and.to.have.deep.property('id', app.id);
            }));

    function prepare() {
      let action;
      let trigger;
      return agent
        .post(`/api/v2/apps/${app.id}/actions`)
        .send({
          name: 'My action',
          description: 'My description',
          data: { flow: { rootTask: { id: 1, activityRef: '' } } },
        })
        .then(response => {
          action = response.body.data;
          return contribTriggersDb.removeAll();
        })
        .then(() => contribTriggersDb.insert({ ref: 'github.com/flogo-web/my/trigger' }))
        .then(contribTrigger => agent.post(`/api/v2/apps/${app.id}/triggers`)
          .send({
            name: 'My trigger',
            description: 'My description',
            ref: contribTrigger.ref,
            settings: {
              key1: 'value',
              key2: 5,
            },
          }))
        .then(response => {
          trigger = response.body.data;
          return agent.put(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`)
            .send({
              settings: { my: 'setting' },
              outputs: { my: 'output', other: 'example' },
            });
        })
        .then(response => {
          const handler = response.body.data;
          return { action, trigger, handler };
        });
    }
  });
});
