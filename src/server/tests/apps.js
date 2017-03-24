import path from 'path';
import enableDestroy from 'server-destroy'; // eslint-disable-line import/no-extraneous-dependencies
import chai from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import chaiHttp from 'chai-http'; // eslint-disable-line import/no-extraneous-dependencies

import { cleanDb } from './clean-db';

const expect = chai.expect;
chai.use(chaiHttp);

process.env.FLOGO_WEB_DISABLE_WS = process.env.FLOGO_WEB_DISABLE_WS || true;
process.env.FLOGO_WEB_DBDIR = process.env.FLOGO_WEB_DBDIR || path.resolve('../dist/local/test_db');
process.env.FLOGO_WEB_LOGLEVEL = process.env.FLOGO_WEB_LOGLEVEL || 'error';

describe('Apps', function () {
  let server;
  let agent;

  before(() => {
    // When it needs to create an engine it can take really long
    // so setting up timeout to 10 minutes
    this.timeout(600000);
    return cleanDb()
      .then(() => require('../server').default)
      .then(app => {
        // server = app.server;
        server = app.server;
        enableDestroy(server);
        agent = chai.request(server.listen());
      });
  });

  it('Should create an app', () => {
    const matchData = {
      id: /\S+/,
      name: 'My app',
      description: 'My description',
      version: '1.0.0',
      updatedAt: null,
    };

    return agent
      .post('/api/v2/apps')
      .send({
        name: 'My app',
        description: 'My description',
        version: '1.0.0',
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an('object');
        const data = res.body.data;
        expect(res.body.data.id).to.exist; // 'App id was assigned');
        expect(data.name).to.equal(matchData.name); // 'Name is correctly saved');
        expect(data.version).to.equal(matchData.version); // 'Version is correctly saved');
        expect(data.updatedAt).to.be.null; // 'Updated at is defined but is null'
        expect(data.createdAt).to.exist; // 'CreatedAt data is defined');
        return data.id;
      })
      .then(appId => agent.get(`/api/v2/apps/${appId}`)
        .then(response => {
          expect(response).to.have.status(200);
          const app = response.body.data;
          expect(app.id).to.equal(appId); // 'App id is present'
          expect(app.description).to.equal(matchData.description); // 'Description is present'
          expect(app.triggers).to.be.an('array').and.to.be.empty;  // 'Triggers is present and empty'
          expect(app.actions).to.be.an('array').and.to.be.empty; // 'Actions is present and empty'
        }));
  });

  it('Should update an app', () => agent
      .post('/api/v2/apps')
      .send({
        name: 'Update my name',
        description: 'Update my description',
        version: '0.1.0',
      })
      .then(res => {
        expect(res).to.have.status(200);
        const body = res.body;
        expect(res.body.data).to.exist;
        expect(body.data.updatedAt).to.be.null;
        const appId = body.data.id;
        return agent.patch(`/api/v2/apps/${appId}`)
          .send({
            name: 'My name was updated',
            description: 'My description was updated',
            version: '0.2.0',
          });
      })
      .then(req => {
        expect(req).to.have.status(200);
        const data = req.body.data;
        expect(data.name).to.equal('My name was updated');
        expect(data.description).to.equal('My description was updated');
        expect(data.version).to.equal('0.2.0');
        expect(data.updatedAt).to.exist;
      }),
  );

  it('Should filter apps by exact name', () => agent
      .post('/api/v2/apps')
      .send({ name: 'Filter me' })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.exist;
        const body = res.body;
        const appId = body.data.id;
        return agent.get('/api/v2/apps')
          .query({ 'filter[name]': 'fIlTER mE' })
          .then(response => {
            expect(res).to.have.status(200);
            const data = response.body.data;
            expect(data).to.be.an('array')
              .and.to.have.lengthOf(1)
              .and.to.have.deep.property('[0].id', appId);
          });
      }),
  );

  it('Should delete an app', () => agent
      .post('/api/v2/apps')
      .send({ name: 'Delete me' })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.an('object');
        const body = res.body;
        const appId = body.data.id;
        return agent.delete(`/api/v2/apps/${appId}`)
          .then(delResponse => {
            expect(delResponse).to.have.status(204);
            return agent.get(`/api/v2/apps/${appId}`)
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
    const appName = 'Cool app';

    const postAppAndExpectName = (expectName) => agent
      .post('/api/v2/apps')
      .send({ name: appName })
      .then(response => {
        expect(response).to.have.status(200);
        expect(response.body.data.name).to.equal(expectName);
      });

    return postAppAndExpectName('Cool app', 'When there\'s no name collision name is saved as provided')
      .then(() => postAppAndExpectName('Cool app (1)', 'Name collision is automatically resolved for the first time'))
      .then(() => postAppAndExpectName('Cool app (2)', 'Name collision is automatically resolved subsequently'));
  });

  // todo: on update name not unique should throw error

  it('Should ignore non editable fields when creating and updating', () => agent
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
      .then(res => {
        expect(res).to.have.status(200);
        const data = res.body.data;
        expect(data.id).to.not.equal('fakeId');
        expect(data.createdAt).to.not.equal('fakeCreatedAt');
        expect(data.updatedAt).to.not.equal('fakeUpdatedAt');
        expect(data.actions).to.not.deep.equal([{ myFakeAction: true }]);
        expect(data.triggers).to.not.deep.equal([{ myFakeTrigger: true }]);
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
        .then(res => {
          expect(res).to.have.status(200);
          const data = res.body.data;
          expect(data.id).to.equal(prevResponse.id);
          expect(data.createdAt).to.equal(prevResponse.createdAt);
          expect(data.updatedAt).to.not.equal('fakeUpdatedAt2');
          expect(data.actions).to.deep.equal(prevResponse.actions);
          expect(data.triggers).to.deep.equal(prevResponse.triggers);
        }),
      ),
  );
});

