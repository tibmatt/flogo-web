import sinon from 'sinon';
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
    expect(extractedTriggerSequence).toEqual(expect.arrayContaining([
      { param: 1 },
      { param: 2 },
      { param: 3 },
    ]));

    expect(triggerFormatterStub.callCount).toBe(3);
    const argsSequence = triggerFormatterStub.args
      .reduce((all, argsOnNthCall) => all.concat(argsOnNthCall), []);
    expect(argsSequence).toEqual([1, 2, 3]);
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
      expect(formattedTrigger).toMatchObject({
        id: 'pin_trigger',
        name: 'Pin trigger',
        ref: mockActivityRef,
        description: 'Simple trigger',
      });
    });
    test('should format the settings', () => {
      expect(formattedTrigger.settings).toEqual(expect.arrayContaining(['pin', 'digital', 'condition']));
    });
    test('should correctly define a handler', () => {
      const [handler] = formattedTrigger.handlers;
      expect(handler).toHaveProperty('settings');
      expect(handler).toHaveProperty('actionId', '123');
    });
  });

  describe('#getSettingsSchema', () => {
    expect(importer.getSettingsSchema(mockActivityRef)).toBeTruthy();
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
        expect(triggerInstanceSettings).toMatchObject({
            pin: 25,
            condition: 'xyz',
          });
      }
    );

    test(
      'should add those settings defined in the trigger schema but not provided by the trigger instance',
      () => {
        expect(triggerInstanceSettings).toMatchObject({ digital: false });
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
