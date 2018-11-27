import sinon from 'sinon';
import { DeviceFormatter } from './device-formatter';

describe('exporter.formatters.DeviceFormatter', () => {
  const sandbox = sinon.createSandbox();
  test('should expand triggers and handlers while preprocessing', () => {
    const deviceFormatter = new DeviceFormatter();
    sandbox.stub(deviceFormatter, 'appHasSubflowTask').returns(false);
    const appResult = deviceFormatter.preprocess({
      triggers: [
        {
          name: 'triggerX',
          handlers: [
            { actionId: 'handlerX1' },
            { actionId: 'handlerX2' },
          ],
        },
        {
          name: 'triggerY',
          handlers: [
            { actionId: 'handlerY1' },
          ],
        },
      ],
    });

    const infoForTriggerWithNameThatStartsWith = (triggerName) => {
      const triggers = appResult.triggers.filter(t => t.name.startsWith(triggerName));
      const handlers = triggers.reduce((allHandlers, trigger) => {
        allHandlers.push(...trigger.handlers.map(h => h.actionId));
        return allHandlers;
      }, []);
      return { triggers, handlers };
    };

    const triggers = appResult.triggers;
    expect(Array.isArray(triggers)).toBe(true)
    expect(triggers).toHaveLength(3);
    triggers.forEach(trigger => expect(trigger.handlers).toHaveLength(1));

    const { triggers: triggersOfTypeX, handlers: handlersOfTypeX } = infoForTriggerWithNameThatStartsWith('triggerX');
    expect(triggersOfTypeX).toHaveLength(2);
    expect(handlersOfTypeX).toEqual(['handlerX1', 'handlerX2']);

    const { triggers: triggersOfTypeY, handlers: handlersOfTypeY } = infoForTriggerWithNameThatStartsWith('triggerY');
    expect(triggersOfTypeY).toHaveLength(1);
    expect(handlersOfTypeY).toEqual(['handlerY1']);
  });
});
