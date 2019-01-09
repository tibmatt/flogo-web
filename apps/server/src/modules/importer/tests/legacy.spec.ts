import { cloneDeep } from 'lodash';
import sinon from 'sinon';
import { AppsService } from '../../apps/apps-service';
import { HandlersService } from '../../apps/handlers-service';
import { AppTriggersService } from '../../apps/triggers';
import { AppImporterFactory } from '../app-importer-factory';
import { ActionsImporter } from '../legacy/actions-importer';
import { LegacyAppImporterFactory } from '../legacy/factory';
import { TriggersHandlersImporter } from '../legacy/triggers-handlers-importer';
import { ActionsManagerMock } from './mocks/actions-manager-mock';
import { ActivitiesManagerMock } from './mocks/activities-mananger-mock';
import { AppsManagerMock } from './mocks/apps-manager-mock';
import { AppsTriggersManagerMock } from './mocks/apps-trigger-manager-mock';
import { HandlerManagerMock } from './mocks/handler-manager-mock';
import { TriggerManagerMock } from './mocks/trigger-mananger-mock';
import { TestContext } from './test-context';
import { TestOptions } from './test-options';
import { itBehavesLikeAnImporter, makeImporterContext } from './test-utils';

const app = require('./samples/legacy-app.json');
const testData = require('./samples/legacy-test-data.json');

const testContext: TestContext = {};
describe('Importer: Legacy', () => {
  beforeAll(async function() {
    testContext.importerFactory = new AppImporterFactory(
      new AppsManagerMock() as AppsService,
      new LegacyAppImporterFactory(
        ActionsManagerMock,
        new ActivitiesManagerMock(),
        new TriggerManagerMock(),
        new HandlerManagerMock() as HandlersService,
        new AppsTriggersManagerMock() as AppTriggersService
      ),
      null
    );
    testContext.importerContext = makeImporterContext(testContext.importerFactory);
    testContext.testOptions = new TestOptions({
      updateTasksRefCb: function(appToUpdate) {
        appToUpdate.actions[0].data.flow.rootTask.tasks[0].activityRef =
          'some.domain/path/to/activity';
        return appToUpdate;
      },
      depsConstructors: {
        actionsImporter: ActionsImporter,
        triggersHandlersImporter: TriggersHandlersImporter,
      },
      expectedActions: [...testData.expect.extractActions],
      expectedTriggers: [...testData.expect.extractTriggers],
      expectedReconciledTriggers: [...testData.expect.reconciledTriggers],
    });
  });

  beforeEach(() => {
    testContext.appToImport = cloneDeep(app);
    testContext.sinonSandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    testContext.sinonSandbox.restore();
  });

  describe('legacy', () => {
    const getTestContext = () => testContext;
    itBehavesLikeAnImporter('legacy', getTestContext);
  });
});
