import {ResourceStorageRegistryMock} from './resource-storage-mock';
import {AppImporterFactory} from '../app-importer-factory';
import {commonTestCases, makeImporterContext} from "./test-utils.spec";
import cloneDeep from 'lodash/cloneDeep';
import {TestOptions} from "./test-options";
import {ActionsImporter} from "../legacy/actions-importer";
import {TriggersHandlersImporter} from "../legacy/triggers-handlers-importer";
import sinon from "sinon";

const app = require('./samples/legacy-app');
const testData = require('./samples/legacy-test-data');

describe('Importer: Legacy', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeAll(async function () {
    this.importerFactory = new AppImporterFactory(ResourceStorageRegistryMock);
    this.importerContext = makeImporterContext(this.importerFactory);
    this.testOptions = new TestOptions({
      updateTasksRefCb: function (app) {
        app.actions[0].data.flow.rootTask.tasks[0].activityRef = "some.domain/path/to/activity";
        return app;
      },
      depsConstructors: {
        actionsImporter: ActionsImporter,
        triggersHandlersImporter: TriggersHandlersImporter
      },
      expectedActions: [...testData.expect.extractActions],
      expectedTriggers: [...testData.expect.extractTriggers],
      expectedReconciledTriggers: [...testData.expect.reconciledTriggers]
    });
  });

  beforeEach(() => {
    testContext.appToImport = cloneDeep(app);
    testContext.sinonSandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    testContext.sinonSandbox.restore();
  });

  commonTestCases('legacy');
});
