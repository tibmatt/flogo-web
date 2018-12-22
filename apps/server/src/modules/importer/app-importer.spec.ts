import sinon from 'sinon';

import { AppImporter } from './app-importer';

describe('importer.AppImporter', () => {
  const { dependencies, importer } = makeContext();

  describe('#import', () => {
    test('should throw an error if the app is invalid', async () => {
      const sandbox = sinon.createSandbox();
      const validateStub = sandbox.stub(importer, 'validateAndCleanAdditionalProperties');
      validateStub.returns({});
      let error = null;
      try {
        await importer.import({});
      } catch (e) {
        error = e;
      }
      expect(error).toBeTruthy();
      sandbox.restore();
    });

    describe('when importing a valid app ', () => {
      let sandbox;
      const testDoubles = {
        validatorStub: null,
        appCreationStub: null,
        actionsImporterStub: null,
        triggerImporterMock: null,
      };
      let importResult;

      beforeAll(async function() {
        sandbox = sinon.createSandbox();
        testDoubles.validatorStub = sandbox
          .stub(importer, 'validateAndCleanAdditionalProperties')
          .callsFake(app => {
            app.id = 'myValidCleanAppId';
          });
        testDoubles.appCreationStub = sandbox
          .stub(dependencies.appStorage, 'create')
          .returns({ id: 'createdAppId' });

        const actionsMap = new Map();
        testDoubles.actionsImporterStub = sandbox
          .stub(dependencies.actionsImporter, 'importAll')
          .returns(actionsMap);
        testDoubles.triggerImporterMock = sandbox.mock(
          dependencies.triggerHandlersImporter
        );
        testDoubles.triggerImporterMock
          .expects('setAppId')
          .once()
          .withArgs('createdAppId');
        testDoubles.triggerImporterMock
          .expects('setActionsByOriginalId')
          .once()
          .withArgs(actionsMap);
        testDoubles.triggerImporterMock.expects('importAll').once();

        importResult = await importer.import({ id: 'myValidRawAppId' });
      });
      afterAll(function() {
        sandbox.restore();
      });
      test('should validate the app structure', () => {
        const validatorStub = testDoubles.validatorStub;
        expect(validatorStub.calledOnce).toBe(true);
      });
      test('should store the app', () => {
        const appCreationStub = testDoubles.appCreationStub;
        expect(appCreationStub.calledOnce).toBe(true);
        expect(appCreationStub.calledWith({ id: 'myValidCleanAppId' })).toBe(true);
      });
      test('should import the actions into the created app', () => {
        const actionsImporterStub = testDoubles.actionsImporterStub;
        expect(actionsImporterStub.calledOnce).toBe(true);
        expect(
          actionsImporterStub.calledWith('createdAppId', {
            id: 'myValidRawAppId',
          })
        ).toBe(true);
      });
      test('should configure the trigger handlers importer and import the triggers and handlers', () => {
        testDoubles.triggerImporterMock.verify();
      });
      test('should return the imported app', () => {
        expect(importResult.id).toBe('createdAppId');
      });
    });
  });

  /**
   * @return {{
   *      importer: AppImporter,
   *      dependencies: {fullAppValidator: {}, appStorage: {}, actionsImporter: {}, triggerHandlersImporter: {}}
   * }}
   */
  function makeContext() {
    const noOp = () => {};
    const fullAppValidator = {} as any;
    const appStorage = { create: noOp } as any;
    const actionsImporter = { importAll: noOp } as any;
    const triggerHandlersImporter = {
      setAppId: noOp,
      setActionsByOriginalId: noOp,
      importAll: noOp,
    } as any;
    const importerInstance = new AppImporter(
      fullAppValidator,
      appStorage,
      actionsImporter,
      triggerHandlersImporter
    );
    return {
      importer: importerInstance,
      dependencies: {
        fullAppValidator,
        appStorage,
        actionsImporter,
        triggerHandlersImporter,
      },
    };
  }
});
