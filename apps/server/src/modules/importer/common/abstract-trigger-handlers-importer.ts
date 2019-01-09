import { flow, map, filter } from 'lodash/fp';
import { normalizeHandlerMappings } from './normalize-handler-mappings';

// todo: define handler interface
type Handler = any;
export abstract class AbstractTriggersHandlersImporter {
  actionsByOriginalId: Map<string, any>;
  appId: string;

  constructor(private triggerStorage, private handlerStore) {
    this.actionsByOriginalId = new Map();
    this.appId = null;
  }

  // eslint-disable-next-line no-unused-vars
  abstract extractHandlers(trigger): any[];

  // eslint-disable-next-line no-unused-vars
  abstract extractTriggers(rawApp): any[];

  setActionsByOriginalId(actionsByOriginalId) {
    this.actionsByOriginalId = actionsByOriginalId;
  }

  setAppId(appId) {
    this.appId = appId;
  }

  async importAll(rawApp) {
    const rawTriggers = this.extractTriggers(rawApp);
    const triggers = this.ensureTriggersHaveNames(rawTriggers);
    const reconciledTriggers = this.reconcileTriggersAndActions(triggers);
    await this.storeTriggersAndHandlers(reconciledTriggers);
  }

  /**
   *
   * @param rawTriggers
   */
  reconcileTriggersAndActions(rawTriggers) {
    const normalizeHandlers = flow(
      map(handler => this.reconcileHandlerWithAction(handler)),
      filter<{ handler?: any; actionId: string }>(
        reconciledHandler => !!reconciledHandler.actionId
      ),
      map(reconciledHandler => ({
        ...reconciledHandler,
        handler: normalizeHandlerMappings(reconciledHandler.handler),
      }))
    );
    return rawTriggers.map(trigger => {
      const rawHandlers = this.extractHandlers(trigger);
      return {
        trigger,
        reconciledHandlers: normalizeHandlers(rawHandlers),
      };
    });
  }

  /**
   * @param handler
   * @return { handler: *, actionId: string|null }
   */
  reconcileHandlerWithAction(
    handler
  ): {
    actionId: string | null;
    handler: Handler;
  } {
    const linkedAction = this.actionsByOriginalId.get(handler.actionId);
    return {
      handler,
      actionId: linkedAction ? linkedAction.id : null,
    };
  }

  ensureTriggersHaveNames(triggers = []) {
    return triggers.map(trigger => ({
      ...trigger,
      name: trigger.name || trigger.id,
    }));
  }

  /**
   *
   * @param {Array.<{trigger, reconciledHandlers: Array.<{ actionId, handler }>}>} triggerGroups
   * @return {Promise<void>}
   */
  async storeTriggersAndHandlers(triggerGroups) {
    /* eslint-disable no-await-in-loop, no-restricted-syntax */
    // await in forOf loop to have the handlers processed in sequence
    for (const triggerGroup of triggerGroups) {
      const trigger = await this.triggerStorage.create(this.appId, triggerGroup.trigger);
      await this.storeHandlers(trigger.id, triggerGroup.reconciledHandlers);
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax */
  }

  /**
   *
   * @param triggerId
   * @param {Array.<{ triggers: *, reconciledHandlers: * }>}reconciledHandlers
   * @return {Promise<void>}
   */
  async storeHandlers(triggerId, reconciledHandlers) {
    /* eslint-disable no-await-in-loop, no-restricted-syntax */
    // await in forOf loop to have the handlers processed in sequence
    for (const handlerData of reconciledHandlers) {
      await this.handlerStore.save(triggerId, handlerData.actionId, handlerData.handler);
    }
    /* eslint-enable no-await-in-loop, no-restricted-syntax */
  }
}
