
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
    const reconciledTriggers = this.reconcileTriggersAndActions(rawTriggers);
    await this.storeTriggersAndHandlers(reconciledTriggers);
  }

  /**
   *
   * @param rawTriggers
   */
  reconcileTriggersAndActions(rawTriggers) {
    return rawTriggers.map(trigger => {
      const rawHandlers = this.extractHandlers(trigger);
      const reconciledHandlers = this
        .reconcileHandlersWithActions(rawHandlers)
        .filter(reconciledHandler => !!reconciledHandler.actionId);
      return { trigger, reconciledHandlers };
    });
  }

  /**
   * @param handlers
   * @return {Array.<{ handler: *, actionId: string|null }>}
   */
  reconcileHandlersWithActions(handlers) {
    return handlers.map(handler => {
      const linkedAction = this.actionsByOriginalId.get(handler.actionId);
      return {
        handler,
        actionId: linkedAction ? linkedAction.id : null,
      };
    });
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
