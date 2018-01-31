import path from 'path';
import enableDestroy from 'server-destroy'; // eslint-disable-line import/no-extraneous-dependencies
import chai from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import chaiHttp from 'chai-http'; // eslint-disable-line import/no-extraneous-dependencies
import {cleanDb} from './clean-db';
import {expectErrorResponse} from './test-utils';
import {triggersDBService} from "../common/db/triggers";

process.env.FLOGO_WEB_DISABLE_WS = process.env.FLOGO_WEB_DISABLE_WS || true;
process.env.FLOGO_WEB_DBDIR = process.env.FLOGO_WEB_DBDIR || path.resolve('../dist/local/test_db');
process.env.FLOGO_WEB_LOGLEVEL = process.env.FLOGO_WEB_LOGLEVEL || 'error';

const expect = chai.expect;
chai.use(chaiHttp);
chai.config.includeStack = true;

describe('Handlers', function () {
  let server;
  let agent;
  let app;
  let contribTrigger;
  let trigger;
  let action;

  const postAction = actionName => agent
    .post(`/api/v2/apps/${app.id}/actions`)
    .send({ name: actionName })
    .then(response => {
      expect(response).to.have.status(200);
      expect(response.body.data.name).to.equal(actionName);
      return response.body.data;
    });

  const postTrigger = triggerName => agent
    .post(`/api/v2/apps/${app.id}/triggers`)
    .send({ name: triggerName, ref: contribTrigger.ref })
    .then(response => {
      expect(response).to.have.status(200);
      expect(response.body.data.name).to.equal(triggerName);
      return response.body.data;
    });

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

        const contribTriggersDb = triggersDBService.db;
        return contribTriggersDb
          .removeAll()
          .then(() => contribTriggersDb.insert({ ref: 'github.com/flogo-web/my/trigger' }))
          .then(savedTrigger => {
            contribTrigger = savedTrigger;
            contribTrigger.id = contribTrigger._id;
            expect(contribTrigger).to.be.an('object').and.to.have.property('id').that.exist;
          });
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
      return postAction('Test action');
    })
    .then(savedAction => {
      action = savedAction;
      return postTrigger('Test trigger');
    })
    .then(savedTrigger => {
      trigger = savedTrigger;
    }));

  // delete the test app
  afterEach(() => agent
    .delete(`/api/v2/apps/${app.id}`)
    .then(response => {
      expect(response, 'App deleted').to.have.status(204);
      app = null;
    }));

  it('should save a handler', () => agent
    .put(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`)
    .send({
      settings: { my: 'setting' },
      outputs: { my: 'output', other: 'example' },
    }).then(res => {
      expect(res, `PUT /triggers/${trigger.id}/handlers/${action.id}`).to.have.status(200);
      expect(res.body.data, 'PUT handler response.data').to.be.an('object');
      const data = res.body.data;
      expect(data.actionId, 'PUT handler actionId').to.equal(action.id);
      expect(data.settings, 'PUT handler settings').to.deep.equal({ my: 'setting' });
      expect(data.outputs, 'PUT handler outputs').to.deep.equal({ my: 'output', other: 'example' });
      expect(data.createdAt, 'PUT handler createdAt').to.exist;
      expect(data.updatedAt, 'PUT handler updatedAt').to.be.null;
      return agent.get(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`);
    })
    .then(response => {
      expect(response, `GET /triggers/${trigger.id}/handlers/${action.id}`).to.have.status(200);
      const handler = response.body.data;
      expect(handler.actionId, 'GET handler actionId').to.equal(action.id);
      expect(handler.appId, 'GET handler appId').to.equal(app.id);
      expect(handler.settings, 'GET handler settings').to.deep.equal({ my: 'setting' });
      expect(handler.outputs, 'GET handler outputs').to.deep.equal({ my: 'output', other: 'example' });
    }),
  );

  it('should update a handler', () => agent
    .put(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`)
    .send({
      settings: { my: 'setting' },
      outputs: { my: 'output', other: 'example' },
    })
    .then(() => agent
      .put(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`)
      .send({
        settings: { my: 'setting', newSetting: 2 },
        outputs: { replaced: true },
      }))
    .then(res => {
      expect(res, `POST /triggers/${trigger.id}/handlers/${action.id}`).to.have.status(200);
      return agent.get(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`);
    })
    .then(response => {
      expect(response, `GET /triggers/${trigger.id}/handlers/${action.id}`).to.have.status(200);
      const handler = response.body.data;
      expect(handler.actionId).to.equal(action.id);
      expect(handler.appId).to.equal(app.id);
      expect(handler.triggerId).to.equal(trigger.id);
      expect(handler.createdAt).to.be.ok;
      expect(handler.updatedAt).to.be.ok;
      expect(handler.settings).to.deep.equal({ my: 'setting', newSetting: 2 });
      expect(handler.outputs).to.deep.equal({ replaced: true });
    }));

  it('should delete a handler', () => agent
    .put(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`)
    .send({
      settings: { my: 'setting' },
      outputs: { my: 'output', other: 'example' },
    })
    .then(res => {
      expect(res).to.have.status(200);
      expect(res.body.data).to.be.an('object');
      return agent.delete(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`)
        .then(delResponse => {
          expect(delResponse).to.have.status(204);
          return agent.get(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`)
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

  context('when saving a flow', () => {
    it('should not allow to edit non-editable properties', () =>
      agent
        .put(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`)
        .send({
          settings: { my: 'new setting' },
          outputs: { my: 'other setting', hello: false },

          appId: 'fakeId',
          actionId: 'fakeActionId',
          triggerId: 'fakeTriggerId',
          createdAt: 'fakeCreatedAt',
          updatedAt: 'fakeUpdatedAt',
          unknown: 'unknown',
        })
        .then(response => {
          expect(response).to.have.status(200);
          const handler = response.body.data;
          expect(handler.triggerId, 'should not allow to change the trigger').to.not.equal('fakeTriggerId');
          expect(handler.appId, 'should not allow to change the application').to.not.equal('fakeId');
          expect(handler.actionId, 'should not allow to change the action').to.not.equal('fakeActionId');
          expect(handler.createdAt, 'should not allow to edit').to.not.equal('fakeCreatedAt');
          expect(handler.updatedAt, 'should not allow to edit').to.not.equal('fakeUpdatedAt');
          expect(handler.unknown, 'should ignore unknown properties').to.not.exist;
        }));
  });

  context('when deleting an action', () => {
    it('should delete its linked handler', () => agent
      .put(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`)
      .send({
        settings: { my: 'setting' },
        outputs: { my: 'output', other: 'example' },
      })
      .then(response => {
        expect(response, `GET /triggers/${trigger.id}/handlers/${action.id}`).to.have.status(200);
        return agent.delete(`/api/v2/actions/${action.id}`);
      })
      .then(response => {
        expect(response, `DELETE /actions/${action.id}`).to.have.status(204);
        return expectErrorResponse(agent.get(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`));
      })
      .then(response => {
        expect(response, `GET /triggers/${trigger.id}/handlers/${action.id}`).to.have.status(404);
        return agent.get(`/api/v2/triggers/${trigger.id}`);
      })
      .then(response => {
        expect(response, `GET /triggers/${trigger.id}`).to.have.status(200);
        expect(response.body.data.handlers.find(h => h.actionId === action.id)).to.be.not.ok;
      }),
    );
  });

  context('when an action is linked to a trigger and the same action is linked to a new trigger', () => {
    it('should delete the previous link', () => agent
      .put(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`)
      .send({
        settings: { my: 'setting' },
        outputs: { my: 'output', other: 'example' },
      })
      .then(response => {
        expect(response, `PUT /triggers/${trigger.id}/handlers/${action.id}`).to.have.status(200);
        return postTrigger('other trigger');
      })
      .then(otherTrigger => agent
        .put(`/api/v2/triggers/${otherTrigger.id}/handlers/${action.id}`)
        .send({
          settings: { my: 'setting' },
          outputs: { my: 'output', other: 'example' },
        })
        .then(response => {
          expect(response, `PUT /triggers/${otherTrigger.id}/handlers/${action.id}`).to.have.status(200);
          return response.body.data;
        }))
      .then(() => expectErrorResponse(agent.get(`/api/v2/triggers/${trigger.id}/handlers/${action.id}`)))
      .then(response => {
        expect(response, `GET /triggers/${trigger.id}/handlers/${action.id}`).to.have.status(404);
        return agent.get(`/api/v2/triggers/${trigger.id}`);
      })
      .then(response => {
        expect(response, `GET /triggers/${trigger.id}`).to.have.status(200);
        expect(response.body.data.handlers.find(h => h.actionId === action.id)).to.be.not.ok;
      }));
  });
});
