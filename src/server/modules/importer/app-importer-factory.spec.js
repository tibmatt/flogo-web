import sinon from 'sinon';
import { expect } from 'chai';
import { DeviceAppImporterFactory } from './device/factory';
import { LegacyAppImporterFactory } from './legacy/factory';
import { AppImporterFactory } from './app-importer-factory';
import { AppImporter } from './app-importer';

describe('importer.AppImporterFactory', function () {
  let sandbox = sinon.createSandbox();
  let context;
  let appImporterFactory;

  before(function () {
    sandbox = sinon.createSandbox();
    context = createTestContext(sandbox);
    appImporterFactory = new AppImporterFactory(context.appsManagerMock);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('when given a standard app', function () {
    const standardApp = { appModel: '1.0.0' };

    it('#isLegacyApp should correctly determine it is a standard app', async function () {
      expect(appImporterFactory.isStandardApp(standardApp)).to.equal(true);
    });

    it('#isStandardApp should accept only appModel 1.0.0', async function () {
      ['', '1.2.4', undefined, 1, 'xyx'].forEach(appModelTestVal =>
        expect(appImporterFactory.isStandardApp({ appModel: appModelTestVal })).not.to.equal(true));
      expect(appImporterFactory.isStandardApp({})).not.to.equal(true);
    });

    it('#dependenciesFactory should select the standard dependencies factory', function () {
      assertFactorySelected('standardDependenciesFactory', standardApp);
    });
  });

  describe('when given a legacy app', function () {
    const legacyApp = { };

    it('#isLegacyApp should correctly determine it is a legacy app', async function () {
      expect(appImporterFactory.isLegacyApp(legacyApp)).to.equal(true);
    });

    it('#dependenciesFactory should select the legacy dependencies factory', function () {
      assertFactorySelected('legacyDependenciesFactory', legacyApp);
    });
  });

  describe('when given a device app', function () {
    const deviceApp = { device: 'devicetype' };

    it('#isDeviceApp should correctly determine it is a device app', async function () {
      expect(appImporterFactory.isDeviceApp(deviceApp)).to.equal(true);
    });

    it('#dependenciesFactory should select the device dependencies factory', function () {
      assertFactorySelected('deviceDependenciesFactory', deviceApp);
    });
  });

  function assertFactorySelected(factorySelector, testApp) {
    const dependenciesFactoryCreator = sandbox
      .stub(appImporterFactory, factorySelector)
      .returns({ id: factorySelector });
    const dependendenciesFactory = appImporterFactory.getDependenciesFactory(testApp);
    expect(dependendenciesFactory.id).to.equal(factorySelector);
    expect(dependenciesFactoryCreator.calledOnce).to.equal(true);
  }

  function createTestContext(sandboxInstance) {
    const stubs = {
      deviceDependenciesFactory: sandboxInstance.createStubInstance(DeviceAppImporterFactory),
      legacyDependenciesFactory: sandboxInstance.createStubInstance(LegacyAppImporterFactory),
      appImporter: sandboxInstance.createStubInstance(AppImporter),
    };

    const factoryResultMock = {
      validator: 'validator',
      actionsImporter: 'actionsImporter',
      triggersHandlersImporter: 'triggerHandlersImporter',
    };

    const appsManagerMock = {
      getAppsManager() {
        return 'appsManager';
      },
    };

    return {
      stubs,
      appImporterFactory,
      factoryResultMock,
      appsManagerMock,
    };
  }
});
