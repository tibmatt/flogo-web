import cloneDeep from 'lodash/cloneDeep';
import sinon from 'sinon';
import { AppsService } from '../../apps/apps-service';
import { HandlersService } from '../../apps/handlers-service';
import { AppTriggersService } from '../../apps/triggers';
import { AppImporterFactory } from '../app-importer-factory';
import { StandardAppImporterFactory } from '../standard/factory';
import { StandardActionsImporter } from '../standard/standard-actions-importer';
import { StandardTriggersHandlersImporter } from '../standard/standard-triggers-handlers-importer';
import { ActionsManagerMock } from './mocks/actions-manager-mock';
import { ActivitiesManagerMock } from './mocks/activities-mananger-mock';
import { AppsManagerMock } from './mocks/apps-manager-mock';
import { AppsTriggersManagerMock } from './mocks/apps-trigger-manager-mock';
import { HandlerManagerMock } from './mocks/handler-manager-mock';
import { TriggerManagerMock } from './mocks/trigger-mananger-mock';
import { TestContext } from './test-context';
import { TestOptions } from './test-options';
import { itBehavesLikeAnImporter, makeImporterContext } from './test-utils';

const app = require('./samples/standard-app.json');
const testData = require('./samples/standard-test-data.json');

const testContext: TestContext = {};
const getTestContext = () => testContext;

describe('Importer: Standard', () => {
  beforeAll(async function() {
    testContext.importerFactory = new AppImporterFactory(
      new AppsManagerMock() as AppsService,
      null,
      new StandardAppImporterFactory(
        ActionsManagerMock,
        new ActivitiesManagerMock(),
        new TriggerManagerMock(),
        new HandlerManagerMock() as HandlersService,
        new AppsTriggersManagerMock() as AppTriggersService
      )
    );
    testContext.importerContext = makeImporterContext(testContext.importerFactory);
    testContext.testOptions = new TestOptions({
      updateTasksRefCb: function(appToUpdate) {
        appToUpdate.resources[0].data.tasks[0].activity.ref =
          'some.domain/path/to/activity';
        return appToUpdate;
      },
      depsConstructors: {
        actionsImporter: StandardActionsImporter,
        triggersHandlersImporter: StandardTriggersHandlersImporter,
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

  describe('standard', () => {
    itBehavesLikeAnImporter('standard', getTestContext);
  });

  test('TriggerHandlerImporter:  should transform handlers as expected', async () => {
    const spyingHandlersExtract = testContext.sinonSandbox.spy(
      (testContext.testOptions.depsConstructors.triggersHandlersImporter as any)
        .prototype,
      'extractHandlers'
    );
    await testContext.importerContext.performImport(testContext.appToImport);
    expect(testContext.importerContext.errors).toBeFalsy();
    const assert = testContext.importerContext.createAssert();
    assert.assertMethodReturnedWithDataAsExpected(spyingHandlersExtract.returnValues[0], [
      ...testData.expect.extractHandlers,
    ]);
  });
});
