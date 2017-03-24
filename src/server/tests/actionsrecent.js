import path from 'path';
import enableDestroy from 'server-destroy'; // eslint-disable-line import/no-extraneous-dependencies
import chai from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import chaiHttp from 'chai-http'; // eslint-disable-line import/no-extraneous-dependencies

process.env.FLOGO_WEB_DISABLE_WS = process.env.FLOGO_WEB_DISABLE_WS || true;
process.env.FLOGO_WEB_DBDIR = process.env.FLOGO_WEB_DBDIR || path.resolve('../dist/local/test_db');
process.env.FLOGO_WEB_LOGLEVEL = process.env.FLOGO_WEB_LOGLEVEL || 'error';

import { cleanDb } from './clean-db';
import { expectErrorResponse } from './test-utils';

const expect = chai.expect;
chai.use(chaiHttp);
chai.config.includeStack = true;

describe('Recent actions', function () {
  const filterComparableData = s => ({ id: s.id, name: s.name });
  let server;
  let agent;
  let app;
  // save 10 actions and call recent endpoint after each save
  // top i recent should equal the last i saved actions
  let savedActions = [];

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
        return agent
          .post('/api/v2/apps')
          .send({ name: 'Test app' });
      })
      .then(response => {
        expect(response).to.have.status(200);
        expect(response.body.data).to.be.an('object');
        app = response.body.data;
      });
  });

  // make sure the test app was deleted
  after(() => expectErrorResponse(agent.get(`/api/v2/apps/${app.id}`))
    .then(response => {
      expect(response, 'App deleted').to.have.status(404);
      app = null;
    }));

  const postAction = actionName => agent
    .post(`/api/v2/apps/${app.id}/actions`)
    .send({ name: actionName })
    .then(response => {
      expect(response).to.have.status(200);
      expect(response.body.data.name).to.equal(actionName);
      return response.body.data;
    });

  const fetchRecent = () => agent
    .get('/api/v2/actions/recent')
    .then(response => {
      expect(response).to.have.status(200);
      expect(response.body.data).to.be.an('array');
      return response.body.data;
    });

  [...Array(10).keys()].forEach(i => {
    const n = i + 1;
    it(`should save new ${n}th flow as recent`, () => postAction(`Action-test-${i}`)
      .then(action => {
        savedActions.unshift(action);
        return fetchRecent();
      })
      .then(recentActions => {
        // get the x elements
        recentActions = recentActions.slice(0, n);
        const savedData = savedActions.map(filterComparableData);
        const recentData = recentActions.map(filterComparableData);
        expect(savedData).to.deep.equal(recentData);
      }));
  });

  describe('when updating an action', () => {
    let actionToUpdate;
    let newRecentActions;

    before(() => {
      actionToUpdate = savedActions[9];
      return agent.patch(`/api/v2/actions/${actionToUpdate.id}`)
        .send({ name: 'Action updated' })
        .then(() => fetchRecent())
        .then(recent => {
          newRecentActions = recent;
        });
    });

    it('should appear at the top of the recent actions', () => {
      expect(newRecentActions).to.be.an('array').and.to.have.deep.property('[0].id', actionToUpdate.id);
    });

    it('should not be duplicated in the recent actions', () => {
      expect(newRecentActions.map(a => a.id)).to.include(actionToUpdate.id);
      expect(newRecentActions.filter(a => a.id === actionToUpdate.id)).to.have.lengthOf(1);
    });
  });

  describe('when deleting an action', () => {
    let actionToDelete;
    const testActionIndex = 8;

    after(() => {
      savedActions = savedActions.filter(a => a.id !== actionToDelete.id);
    });

    it('should not appear as recent anymore', () => {
      // newRecentActions.length
      actionToDelete = savedActions[testActionIndex];
      return agent.delete(`/api/v2/actions/${actionToDelete.id}`)
        .then(() => fetchRecent())
        .then(newRecentActions => {
          expect(newRecentActions).to.have.length.of.at.least(savedActions.length - 1);
          expect(newRecentActions.map(a => a.id)).to.not.include(actionToDelete.id);
        });

    });
  });

  describe('when removing an app', () => {
    it('none of its actions should appear in the recent actions', () => fetchRecent()
      .then(recent => {
        const recentIds = recent.map(a => a.id);
        savedActions.forEach(oldAction => expect(recentIds).to.include(oldAction.id));
        return agent.delete(`/api/v2/apps/${app.id}`);
      })
      .then(() => fetchRecent())
      .then(recent => {
        const recentIds = recent.map(a => a.id);
        savedActions.forEach(oldAction => expect(recentIds).to.not.include(oldAction.id));
      }),
    );
  });
});
