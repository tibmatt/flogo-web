import sinon from 'sinon';
import { DeviceAppImporterFactory } from './device/factory';
import { LegacyAppImporterFactory } from './legacy/factory';
import { AppImporterFactory } from './app-importer-factory';
import { AppImporter } from './app-importer';

describe('importer.AppImporterFactory', () => {
  let sandbox = sinon.createSandbox();
  let context;
  let appImporterFactory;

  beforeAll(function () {
    sandbox = sinon.createSandbox();
    context = createTestContext(sandbox);
    appImporterFactory = new AppImporterFactory(context.appsManagerMock);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('when given a standard app', () => {
    const standardApp = { appModel: '1.0.0' };

    test(
      '#isLegacyApp should correctly determine it is a standard app',
      async () => {
        expect(appImporterFactory.isStandardApp(standardApp)).toBe(true);
      }
    );

    test('#isStandardApp should accept only appModel 1.0.0', async () => {
      ['', '1.2.4', undefined, 1, 'xyx'].forEach(appModelTestVal =>
        expect(appImporterFactory.isStandardApp({ appModel: appModelTestVal })).not.toBe(true));
      expect(appImporterFactory.isStandardApp({})).not.toBe(true);
    });

    test(
      '#dependenciesFactory should select the standard dependencies factory',
      () => {
        assertFactorySelected('standardDependenciesFactory', standardApp);
      }
    );
  });

  describe('when given a legacy app', () => {
    const legacyApp = { };

    test(
      '#isLegacyApp should correctly determine it is a legacy app',
      async () => {
        expect(appImporterFactory.isLegacyApp(legacyApp)).toBe(true);
      }
    );

    test(
      '#dependenciesFactory should select the legacy dependencies factory',
      () => {
        assertFactorySelected('legacyDependenciesFactory', legacyApp);
      }
    );
  });

  describe('when given a device app', () => {
    const deviceApp = { device: 'devicetype' };

    test(
      '#isDeviceApp should correctly determine it is a device app',
      async () => {
        expect(appImporterFactory.isDeviceApp(deviceApp)).toBe(true);
      }
    );

    test(
      '#dependenciesFactory should select the device dependencies factory',
      () => {
        assertFactorySelected('deviceDependenciesFactory', deviceApp);
      }
    );
  });

  function assertFactorySelected(factorySelector, testApp) {
    const dependenciesFactoryCreator = sandbox
      .stub(appImporterFactory, factorySelector)
      .returns({ id: factorySelector });
    const dependendenciesFactory = appImporterFactory.getDependenciesFactory(testApp);
    expect(dependendenciesFactory.id).toBe(factorySelector);
    expect(dependenciesFactoryCreator.calledOnce).toBe(true);
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
