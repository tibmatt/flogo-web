import sinon from 'sinon';
import { expect } from 'chai';
import { TriggersHandlersImporter } from './triggers-handlers-importer';

describe('importer.device.TriggersHandlersImporter', () => {
  const mockActivityRef = 'github.com/TIBCOSoftware/flogo-contrib/device/trigger/pin';
  const triggerSchemaMock = getTriggerSchemaMock();
  const importer = new TriggersHandlersImporter({}, {}, [triggerSchemaMock]);

  test('#extractTriggers should format all triggers', () => {
    const sandbox = sinon.createSandbox();
    const triggerFormatterStub = sandbox.stub(importer, 'formatTrigger');
    triggerFormatterStub.callsFake(i => ({ param: i }));

    const extractedTriggerSequence = importer.extractTriggers({
      triggers: [1, 2, 3],
    });
    expect(extractedTriggerSequence).to.have.deep.members([
      { param: 1 },
      { param: 2 },
      { param: 3 },
    ]);

    expect(triggerFormatterStub.callCount).to.equal(3);
    const argsSequence = triggerFormatterStub.args
      .reduce((all, argsOnNthCall) => all.concat(argsOnNthCall), []);
    expect(argsSequence).to.deep.equal([1, 2, 3]);
    sandbox.restore();
  });

  describe('#formatTrigger', () => {
    let formattedTrigger;
    beforeAll(() => {
      formattedTrigger = importer.formatTrigger({
        id: 'pin_trigger',
        actionId: '123',
        name: 'Pin trigger',
        ref: mockActivityRef,
        description: 'Simple trigger',
        settings: {},
      });
    });

    test('copy the trigger attributes', () => {
      expect(formattedTrigger).to.deep.include({
        id: 'pin_trigger',
        name: 'Pin trigger',
        ref: mockActivityRef,
        description: 'Simple trigger',
      });
    });
    test('should format the settings', () => {
      expect(formattedTrigger.settings).to.have.keys(['pin', 'digital', 'condition']);
    });
    test('should correctly define a handler', () => {
      const [handler] = formattedTrigger.handlers;
      expect(handler).to.have.property('settings');
      expect(handler).to.have.property('actionId', '123');
    });
  });

  describe('#getSettingsSchema', () => {
    expect(importer.getSettingsSchema(mockActivityRef)).to.be.ok;
  });

  describe('#makeTriggerSettings', () => {
    let triggerInstanceSettings;

    beforeAll(() => {
      triggerInstanceSettings = importer.makeTriggerSettings({
        ref: mockActivityRef,
        settings: {
          pin: 25,
          condition: 'xyz',
        },
      });
    });

    test(
      'should correctly match the trigger settings with its corresponding activity schema',
      () => {
        expect(triggerInstanceSettings)
          .to.deep.include({
            pin: 25,
            condition: 'xyz',
          });
      }
    );

    test(
      'should add those settings defined in the trigger schema but not provided by the trigger instance',
      () => {
        expect(triggerInstanceSettings)
          .to.deep.include({ digital: false });
      }
    );
  });

  function getTriggerSchemaMock() {
    return {
      name: 'tibco-device-pin',
      type: 'flogo:device:trigger',
      ref: 'github.com/TIBCOSoftware/flogo-contrib/device/trigger/pin',
      version: '0.0.1',
      title: 'Trigger on Pin Condition',
      description: 'Simple Device Pin Trigger',
      settings: [
        {
          name: 'pin',
          type: 'int',
        },
        {
          name: 'digital',
          type: 'boolean',
        },
        {
          name: 'condition',
          type: 'string',
        },
      ],
      outputs: [
        {
          name: 'value',
          type: 'int',
        },
      ],
      device_support: [
        {
          framework: 'arduino',
          template: 'pin.ino.tmpl',
        },
      ],
    };
  }
});
