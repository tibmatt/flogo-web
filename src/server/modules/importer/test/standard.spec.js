import {ResourceStorageRegistryMock} from './resource-storage-mock';
import {AppImporterFactory} from '../app-importer-factory';
import {commonTestCases, makeImporterContext} from './test-utils.spec';
import cloneDeep from 'lodash/cloneDeep';
import {TestOptions} from "./test-options";
import {StandardActionsImporter} from "../standard/standard-actions-importer";
import {StandardTriggersHandlersImporter} from "../standard/standard-triggers-handlers-importer";

const app = require('./samples/standard-app');

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
      }
    });
  });

  beforeEach(function(){
    this.appToImport = cloneDeep(app);
  });

  commonTestCases('standard');

});
