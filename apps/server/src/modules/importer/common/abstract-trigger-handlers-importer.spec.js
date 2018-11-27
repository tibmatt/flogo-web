import sinon from 'sinon';
import { AbstractTriggersHandlersImporter } from './abstract-trigger-handlers-importer';

describe('importer.common.AbstractTriggerHandlersImporter', () => {
  const sandbox = sinon.createSandbox();
  const triggerStorage = {
    create(appId, trigger) {
      return trigger;
    },
  };
  const handlerStorage = {
    save() {
    },
  };
  const importer = new class extends AbstractTriggersHandlersImporter {
    extractHandlers(trigger) {
      return trigger.handlers;
    }

    extractTriggers(rawApp) {
      return rawApp.triggers;
    }
  }(triggerStorage, handlerStorage);

  beforeAll(() => {
    importer.setAppId('appId');
    const actionsMap = new Map()
      .set('a', { id: 'a-stored' })
      .set('b', { id: 'b-stored' })
      .set('c', { id: 'c-stored' });
    importer.setActionsByOriginalId(actionsMap);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#reconcileTriggersAndActions', () => {
    let result;
    let reconcileHandlerStub;
    beforeAll(() => {
      const mockHandlers = Array(4).fill('mockhandler');
      const mockTriggers = [
        { id: 'trigger1', handlers: mockHandlers },
        { id: 'trigger2', handlers: mockHandlers },
      ];
      const responsesPerHandler = [
        { actionId: 'actionA', handler: {} },
        { handler: {} },
        { actionId: 'actionB', handler: {} },
        { actionId: null, handler: {} },
      ];
      reconcileHandlerStub = sandbox
        .stub(importer, 'reconcileHandlerWithAction');
      [...responsesPerHandler, ...responsesPerHandler].forEach((mockReturn, index) => {
        reconcileHandlerStub.onCall(index).returns(mockReturn);
      });
      result = importer.reconcileTriggersAndActions(mockTriggers);
    });

    test('should call reconcile handlers for every trigger', () => {
      expect(reconcileHandlerStub.callCount).toBe(8);
      expect(reconcileHandlerStub.alwaysCalledWith(['mockHandlers']));
    });

    test('should process all triggers', () => {
      expect(result).toHaveLength(2);
      expect(result.map(group => group.trigger.id)).toEqual(['trigger1', 'trigger2']);
    });

    test('should omit dangling handlers (not linked to an action)', () => {
      const pluckActionIdsFromHandlers = handlerGroup => handlerGroup.map(h => h.actionId);
      const actionIdGroups = result.map(group => pluckActionIdsFromHandlers(group.reconciledHandlers));
      expect(actionIdGroups).toHaveLength(2);
      actionIdGroups.forEach(group => {
        expect(group).toEqual(['actionA', 'actionB']);
      });
    });
  });

  describe('#reconcileHandlerWithAction', () => {
    test('should correctly map old handler links to new actions', () => {
      const linkedHandlers = [
        { id: 'a-1', actionId: 'a' },
        { id: 'b-1', actionId: 'b' },
        { id: 'a-2', actionId: 'a' },
      ];
      linkedHandlers.forEach(handler => {
        const reconciledHandler = importer.reconcileHandlerWithAction(handler);
        expect(reconciledHandler).toBeTruthy();
        expect(reconciledHandler.actionId).toBe(`${handler.actionId}-stored`);
      });
    });

    test('should handle dangling handlers', () => {
      const danglingHandler = { id: 'x-1', actionId: '??' };
      expect(importer.reconcileHandlerWithAction(danglingHandler).actionId).toBeNull();
    });
  });

  test('#storeTriggersAndHandlers', async () => {
    const storeHandlersStub = sandbox.stub(importer, 'storeHandlers');
    const storeTriggersSpy = sandbox.spy(triggerStorage, 'create');
    await importer.storeTriggersAndHandlers([
      { trigger: { id: 'trigger1' }, reconciledHandlers: [{ actionId: 'a-stored', handler: {} }] },
      { trigger: { id: 'trigger2' }, reconciledHandlers: [{ actionId: 'b-stored', handler: {} }] },
    ]);
    expect(storeTriggersSpy.callCount).toBe(2);
    const callArgs = storeHandlersStub.getCalls().map(call => {
      const [triggerId, [handlerInfo]] = call.args;
      return [triggerId, handlerInfo.actionId];
    });
    expect(callArgs).toEqual(
      expect.arrayContaining([
        ['trigger1', 'a-stored'],
        ['trigger2', 'b-stored'],
      ])
    );
  });

  test('#storeHandlers', async () => {
    const handlerStoreSpy = sandbox.spy(handlerStorage, 'save');
    await importer.storeHandlers('triggerX', [
      { actionId: 'actionA', handler: { id: 'handlerA' } },
      { actionId: 'actionB', handler: { id: 'handlerB' } },
    ]);
    expect(handlerStoreSpy.callCount).toBe(2);
    const callArgs = handlerStoreSpy.getCalls().map(call => {
      const [triggerId, actionId, { id: handlerId }] = call.args;
      return [triggerId, actionId, handlerId];
    });
    expect(callArgs).toEqual(
      expect.arrayContaining([
        ['triggerX', 'actionA', 'handlerA'],
        ['triggerX', 'actionB', 'handlerB']
      ])
    );
  });
});
