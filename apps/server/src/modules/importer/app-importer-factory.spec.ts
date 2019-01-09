import sinon from 'sinon';
import { LegacyAppImporterFactory } from './legacy/factory';
import { AppImporterFactory } from './app-importer-factory';
import { AppImporter } from './app-importer';
import { AppsService } from '../apps/apps-service';

interface FakeDependenciesFactory {
  name: string;
}

describe('importer.AppImporterFactory', () => {
  let sandbox = sinon.createSandbox();
  let context;
  let appImporterFactory: AppImporterFactory;

  beforeAll(function() {
    sandbox = sinon.createSandbox();
    context = createTestContext(sandbox);
    appImporterFactory = new AppImporterFactory(
      null,
      {
        name: 'legacyDependenciesFactory',
      } as any,
      {
        name: 'standardDependenciesFactory',
      } as any
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('when given a standard app', () => {
    const standardApp = { appModel: '1.0.0', type: 'flogo:app' };

    test('#isLegacyApp should correctly determine it is a standard app', async () => {
      expect(appImporterFactory.isStandardApp(standardApp)).toBe(true);
    });

    test('#isStandardApp should accept only appModel 1.0.0', async () => {
      ['', '1.2.4', undefined, 1, 'xyx'].forEach(appModelTestVal =>
        expect(
          appImporterFactory.isStandardApp({
            appModel: appModelTestVal,
            type: 'flogo:app',
          })
        ).not.toBe(true)
      );
      expect(appImporterFactory.isStandardApp({})).not.toBe(true);
    });

    test('#dependenciesFactory should select the standard dependencies factory', () => {
      assertFactorySelected('standardDependenciesFactory', standardApp);
    });
  });

  describe('when given a legacy app', () => {
    const legacyApp = { type: 'flogo:app' };

    test('#isLegacyApp should correctly determine it is a legacy app', async () => {
      expect(appImporterFactory.isLegacyApp(legacyApp)).toBe(true);
    });

    test('#dependenciesFactory should select the legacy dependencies factory', () => {
      assertFactorySelected('legacyDependenciesFactory', legacyApp);
    });
  });

  function assertFactorySelected(factorySelector, testApp) {
    const dependenciesFactory = appImporterFactory.getDependenciesFactory(
      testApp
    ) as unknown;
    expect((dependenciesFactory as FakeDependenciesFactory).name).toBe(factorySelector);
  }

  function createTestContext(sandboxInstance) {
    const stubs = {
      legacyDependenciesFactory: sandboxInstance.createStubInstance(
        LegacyAppImporterFactory
      ),
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
