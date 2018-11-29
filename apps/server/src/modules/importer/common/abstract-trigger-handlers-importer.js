import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
// TODO: regular import {normalizedHandlerMappings} is undefined during runtime, probably something related
// with the combination of typescript + js + class extension
const { normalizeHandlerMappings } = require('./normalize-handler-mappings');

export class AbstractTriggersHandlersImporter {
  /**
   * @param {{ create: Function(string, object):Promise }} triggerStorage
   * @param {{ save: Function(string, string, object):Promise }} handlerStore
   */
  constructor(triggerStorage, handlerStore) {
    this.handlerStore = handlerStore;
    this.triggerStorage = triggerStorage;
    this.actionsByOriginalId = new Map();
    this.appId = null;
  }

  // eslint-disable-next-line no-unused-vars
  extractHandlers(trigger) {
    throw new Error('You have to implement the method extractHandlers!');
  }

  // eslint-disable-next-line no-unused-vars
  extractTriggers(rawApp) {
    throw new Error('You have to implement the method extractTriggers!');
  }

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
      filter(reconciledHandler => !!reconciledHandler.actionId),
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
  reconcileHandlerWithAction(handler) {
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
