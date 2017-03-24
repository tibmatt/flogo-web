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

describe('Triggers', function () {
  let server;
  let agent;
  let contribTrigger;
  let app;

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

        const contribTriggersDb = require('../config/app-config').triggersDBService.db;
        return contribTriggersDb
          .removeAll()
          .then(() => contribTriggersDb.insert({ ref: 'github.com/flogo-web/my/trigger' }))
          .then(trigger => {
            contribTrigger = trigger;
            contribTrigger.id = contribTrigger._id;
            expect(contribTrigger).to.be.an('object').and.to.have.property('id').that.exist;
          });
      });
  });

  // create test app to save the triggers into
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

  it('Should create trigger in an app', () => {
    const matchData = {
      id: /\S+/,
      name: 'My trigger',
      description: 'My description',
      settings: {
        key1: 'value',
        key2: 5,
      },
      handlers: [],
      updatedAt: null,
    };

    return agent.post(`/api/v2/apps/${app.id}/triggers`)
      .send({
        name: 'My trigger',
        description: 'My description',
        ref: contribTrigger.ref,
        settings: {
          key1: 'value',
          key2: 5,
        },
      }).then(res => {
        expect(res, `POST /apps/${app.id}/triggers`).to.have.status(200);
        expect(res.body.data).to.be.an('object');
        const data = res.body.data;
        expect(data.id).to.exist;
        expect(data.appId).to.equal(app.id);
        expect(data.name).to.equal(matchData.name);
        expect(data.ref).to.equal(contribTrigger.ref);
        expect(data.settings).to.deep.equal(matchData.settings);
        expect(data.updatedAt).to.be.null;
        expect(data.createdAt).to.exist;
        return data.id;
      })
      .then(triggerId => agent
        .get(`/api/v2/triggers/${triggerId}`)
        .then(response => {
          expect(response, `GET /triggers/${triggerId}`).to.have.status(200);
          const trigger = response.body.data;
          expect(trigger.id).to.equal(triggerId);
          expect(trigger.appId).to.equal(app.id);
          expect(trigger.ref).to.equal(contribTrigger.ref);
          expect(trigger.description).to.equal(matchData.description);
          expect(trigger.settings).to.deep.equal(matchData.settings);
          expect(trigger.handlers).to.be.empty.and.to.be.an('array');
        }));
  });

  it('Should update a trigger', () =>
    agent
      .post(`/api/v2/apps/${app.id}/triggers`)
      .send({
        name: 'Update my name',
        ref: contribTrigger.ref,
        description: 'Update my description',
        settings: { mySetting: 'update my settings' },
      })
    .then(res => {
      expect(res).to.have.status(200);
      const body = res.body;
      expect(res.body.data).to.exist;
      expect(body.data.updatedAt).to.be.null;
      const triggerId = body.data.id;
      return agent.patch(`/api/v2/triggers/${triggerId}`)
        .send({
          name: 'My name was updated',
          description: 'My description was updated',
          settings: { updatedSettings: 'new setting' },
        });
    })
    .then(req => {
      expect(req).to.have.status(200);
      const data = req.body.data;
      expect(data.name).to.equal('My name was updated');
      expect(data.description).to.equal('My description was updated');
      expect(data.settings).to.deep.equal({ updatedSettings: 'new setting' });
      expect(data.updatedAt).to.exist;
    }),
  );

  it('Should delete a trigger', () => agent
    .post(`/api/v2/apps/${app.id}/triggers`)
      .send({ name: 'Delete me', ref: contribTrigger.ref })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an('object');
        const body = res.body;
        const triggerId = body.data.id;
        return agent.delete(`/api/v2/triggers/${triggerId}`)
          .then(delResponse => {
            expect(delResponse).to.have.status(204);
            return agent.get(`/api/v2/triggers/${triggerId}`)
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
    const triggerName = 'Cool trigger';

    const postTriggerAndExpectName = (expectName) => agent
      .post(`/api/v2/apps/${app.id}/triggers`)
      .send({ name: triggerName, ref: contribTrigger.ref })
      .then(response => {
        expect(response).to.have.status(200);
        expect(response.body.data.name).to.equal(expectName);
      });

    return postTriggerAndExpectName('Cool trigger', 'When there\'s no name collision name is saved as provided')
      .then(() => postTriggerAndExpectName('Cool trigger (1)', 'Name collision is automatically resolved for the first time'))
      .then(() => postTriggerAndExpectName('Cool trigger (2)', 'Name collision is automatically resolved subsequently'));
  });

  // todo: on update name not unique should throw error

  it('Should ignore non editable fields when creating and updating', () => agent
    .post(`/api/v2/apps/${app.id}/triggers`)
    .send({
      name: 'Test non editable',
      description: 'My description',
      ref: contribTrigger.ref,
      settings: { a: 1, b: 2 },

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
      expect(data.unknown).to.not.exist;
      return data;
    })
    .then(prevResponse => agent
      .patch(`/api/v2/triggers/${prevResponse.id}`)
      .send({
        id: 'fakeId2',
        createdAt: 'fakeCreatedAt2',
        updatedAt: 'fakeUpdatedAt2',
        ref: 'fakeref',
        unknown: 'unknown',
      })
      .then(res => {
        expect(res).to.have.status(200);
        const data = res.body.data;
        expect(data.id).to.equal(prevResponse.id);
        expect(data.createdAt).to.equal(prevResponse.createdAt);
        expect(data.updatedAt).to.not.equal('fakeUpdatedAt2');
        expect(data.ref).to.equal(contribTrigger.ref);
        expect(data.unknown).to.not.exist;
      }),
    ),
  );
});
