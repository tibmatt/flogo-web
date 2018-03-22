import {ResourceStorageRegistryMock} from './resource-storage-mock';
import {AppImporterFactory} from '../app-importer-factory';
import {commonTestCases, makeImporterContext} from './test-utils.spec';
import cloneDeep from 'lodash/cloneDeep';
import {TestOptions} from "./test-options";
import {StandardActionsImporter} from "../standard/standard-actions-importer";
import {StandardTriggersHandlersImporter} from "../standard/standard-triggers-handlers-importer";
import sinon from "sinon";

const app = require('./samples/standard-app');
const testData = require('./samples/standard-test-data');

describe('Importer: Standard', function () {

  before(async function () {
    this.importerFactory = new AppImporterFactory(ResourceStorageRegistryMock);
    this.importerContext = makeImporterContext(this.importerFactory);
    this.testOptions = new TestOptions({
      updateTasksRefCb: function (app) {
        app.resources[0].data.tasks[0].activity.ref = "some.domain/path/to/activity";
        return app;
      },
      depsConstructors: {
        actionsImporter: StandardActionsImporter,
        triggersHandlersImporter: StandardTriggersHandlersImporter
      },
      expectedActions: [...testData.expect.extractActions],
      expectedTriggers: [...testData.expect.extractTriggers],
      expectedReconciledTriggers: [...testData.expect.reconciledTriggers]
    });
  });

  beforeEach(function(){
    this.appToImport = cloneDeep(app);
  });

  commonTestCases('standard');

  it("TriggerHandlerImporter:  should transform handlers as expected", async function(){
    const spyingHandlersExtract = sinon.spy(this.testOptions.depsConstructors.triggersHandlersImporter.prototype, "extractHandlers");
    const assert = await this.importerContext.importAndCreateAssert(this.appToImport);
    assert.assertIsSuccessful()
      .assertMethodReturnedWithDataAsExpected(spyingHandlersExtract.returnValues[0], [...testData.expect.extractHandlers]);
    spyingHandlersExtract.restore();
  });
});
