import sinon from 'sinon';
import { expect } from 'chai';
import { DeviceFormatter } from './device-formatter';

describe('exporter.formatters.DeviceFormatter', function () {
  const sandbox = sinon.createSandbox();
  it('should expand triggers and handlers while preprocessing', function () {
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
    expect(triggers).to.be.an('array').of.length(3);
    triggers.forEach(trigger => expect(trigger.handlers).to.have.length(1));

    const { triggers: triggersOfTypeX, handlers: handlersOfTypeX } = infoForTriggerWithNameThatStartsWith('triggerX');
    expect(triggersOfTypeX).to.have.length(2);
    expect(handlersOfTypeX).to.deep.equal(['handlerX1', 'handlerX2']);

    const { triggers: triggersOfTypeY, handlers: handlersOfTypeY } = infoForTriggerWithNameThatStartsWith('triggerY');
    expect(triggersOfTypeY).to.have.length(1);
    expect(handlersOfTypeY).to.deep.equal(['handlerY1']);
  });
});
