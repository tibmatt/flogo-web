import sinon from 'sinon';
import cloneDeep from 'lodash/cloneDeep';

import { StandardTriggersHandlersImporter } from '../standard/standard-triggers-handlers-importer';
import { AppImporterFactory } from '../app-importer-factory';
import { ResourceStorageRegistryMock } from './resource-storage-mock';
import { createSharedTestCases, makeImporterContext } from './test-utils';
import { TestOptions } from './test-options';
import { StandardActionsImporter } from '../standard/standard-actions-importer';
import { TestContext } from './test-context';

const app = require('./samples/standard-app.json');
const testData = require('./samples/standard-test-data.json');

const testContext: TestContext = {};
const getTestContext = () => testContext;

describe('Importer: Standard', () => {
  beforeAll(async function() {
    testContext.importerFactory = new AppImporterFactory(
      ResourceStorageRegistryMock as any
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

  createSharedTestCases('standard', getTestContext).forEach(([description, testCase]) => {
    test(description, testCase);
  });

  test('TriggerHandlerImporter:  should transform handlers as expected', async () => {
    const spyingHandlersExtract = testContext.sinonSandbox.spy(
      (testContext.testOptions.depsConstructors.triggersHandlersImporter as any)
        .prototype,
      'extractHandlers'
    );
    const assert = await testContext.importerContext.importAndCreateAssert(
      testContext.appToImport
    );
    assert
      .assertIsSuccessful()
      .assertMethodReturnedWithDataAsExpected(spyingHandlersExtract.returnValues[0], [
        ...testData.expect.extractHandlers,
      ]);
  });
});
