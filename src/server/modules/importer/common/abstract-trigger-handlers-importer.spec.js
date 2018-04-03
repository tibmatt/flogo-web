import sinon from 'sinon';
import { expect } from 'chai';
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

  before(() => {
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
    before(() => {
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

    it('should call reconcile handlers for every trigger', () => {
      expect(reconcileHandlerStub.callCount).to.equal(8);
      expect(reconcileHandlerStub.alwaysCalledWith(['mockHandlers']));
    });

    it('should process all triggers', () => {
      expect(result).to.have.length(2);
      expect(result.map(group => group.trigger.id))
        .to.deep.equal(['trigger1', 'trigger2']);
    });

    it('should omit dangling handlers (not linked to an action)', () => {
      const pluckActionIdsFromHandlers = handlerGroup => handlerGroup.map(h => h.actionId);
      const actionIdGroups = result.map(group => pluckActionIdsFromHandlers(group.reconciledHandlers));
      expect(actionIdGroups).to.have.length(2);
      actionIdGroups.forEach(group => {
        expect(group).to.deep.equal(['actionA', 'actionB']);
      });
    });
  });

  describe('#reconcileHandlerWithAction', () => {
    it('should correctly map old handler links to new actions', () => {
      const linkedHandlers = [
        { id: 'a-1', actionId: 'a' },
        { id: 'b-1', actionId: 'b' },
        { id: 'a-2', actionId: 'a' },
      ];
      linkedHandlers.forEach(handler => {
        const reconciledHandler = importer.reconcileHandlerWithAction(handler);
        expect(reconciledHandler).to.be.ok;
        expect(reconciledHandler.actionId).to.equal(`${handler.actionId}-stored`);
      });
    });

    it('should handle dangling handlers', () => {
      const danglingHandler = { id: 'x-1', actionId: '??' };
      expect(importer.reconcileHandlerWithAction(danglingHandler).actionId).to.be.a('null');
    });
  });

  it('#storeTriggersAndHandlers', async () => {
    const storeHandlersStub = sandbox.stub(importer, 'storeHandlers');
    const storeTriggersSpy = sandbox.spy(triggerStorage, 'create');
    await importer.storeTriggersAndHandlers([
      { trigger: { id: 'trigger1' }, reconciledHandlers: [{ actionId: 'a-stored', handler: {} }] },
      { trigger: { id: 'trigger2' }, reconciledHandlers: [{ actionId: 'b-stored', handler: {} }] },
    ]);
    expect(storeTriggersSpy.callCount).to.equal(2);
    const callArgs = storeHandlersStub.getCalls().map(call => {
      const [triggerId, [handlerInfo]] = call.args;
      return [triggerId, handlerInfo.actionId];
    });
    expect(callArgs)
      .to.deep.include(['trigger1', 'a-stored'])
      .and.to.deep.include(['trigger2', 'b-stored']);
  });

  it('#storeHandlers', async () => {
    const handlerStoreSpy = sandbox.spy(handlerStorage, 'save');
    await importer.storeHandlers('triggerX', [
      { actionId: 'actionA', handler: { id: 'handlerA' } },
      { actionId: 'actionB', handler: { id: 'handlerB' } },
    ]);
    expect(handlerStoreSpy.callCount).to.equal(2);
    const callArgs = handlerStoreSpy.getCalls().map(call => {
      const [triggerId, actionId, { id: handlerId }] = call.args;
      return [triggerId, actionId, handlerId];
    });
    expect(callArgs)
      .to.deep.include(['triggerX', 'actionA', 'handlerA'])
      .and.to.deep.include(['triggerX', 'actionB', 'handlerB']);
  });
});
