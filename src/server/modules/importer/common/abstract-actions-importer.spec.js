import { expect } from 'chai';
import { AbstractActionsImporter } from './abstract-actions-importer';

describe('importer.common.AbstractActionsImporter', function () {
  class ActionsImporterImpl extends AbstractActionsImporter {
    constructor() {
      super({
        create(appId, action) {
          return Promise.resolve({ ...action, id: `${action.id}-processed` });
        },
      });
    }
    extractActions(fromApp) {
      return fromApp.actions;
    }
  }
  let importerInstance;
  before(function () {
    importerInstance = new ActionsImporterImpl();
  });

  it('should map the original action id to the stored action id after importing', async function () {
    const actionsMock = {
      actions: [
        { id: 'a' }, { id: 'b' }, { id: 'c' },
      ],
    };
    const actionMap = await importerInstance.importAll('appId', actionsMock);
    expect(actionMap).to.be.a('Map');
    ['a', 'b', 'c'].forEach(id => {
      const action = actionMap.get(id);
      expect(action).to.be.ok;
      expect(action.id).to.equal(`${id}-processed`);
    });
  });
});
