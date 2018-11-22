import { AbstractActionsImporter } from './abstract-actions-importer';

describe('importer.common.AbstractActionsImporter', () => {
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
  beforeAll(function () {
    importerInstance = new ActionsImporterImpl();
  });

  test(
    'should map the original action id to the stored action id after importing',
    async () => {
      const actionsMock = {
        actions: [
          { id: 'a' }, { id: 'b' }, { id: 'c' },
        ],
      };
      const actionMap = await importerInstance.importAll('appId', actionsMock);
      expect(typeof actionMap).toBe('Map');
      ['a', 'b', 'c'].forEach(id => {
        const action = actionMap.get(id);
        expect(action).toBeTruthy();
        expect(action.id).toBe(`${id}-processed`);
      });
    }
  );
});
