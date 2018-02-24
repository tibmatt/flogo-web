
export class AbstractActionsImporter {
  constructor(actionStorage) {
    this.actionStorage = actionStorage;
  }

  // eslint-disable-next-line no-unused-vars
  extractActions(fromRawApp) {
    throw new Error('You have to implement the method extractActions!');
  }

  async importAll(fromRawApp) {
    const rawActions = this.extractActions(fromRawApp);
    return new Map(await this.storeActions(rawActions));
  }

  async storeActions(appId, rawActions = []) {
    const actionPromises = rawActions.map(async (actionMap, rawAction) => {
      const originalActionId = rawAction.id;
      const action = await this.storeSingleAction(appId, rawAction);
      return [originalActionId, action];
    });
    return Promise.all(actionPromises);
  }

  /**
   *
   * @param appId
   * @param rawAction
   * @return {Promise}
   */
  async storeSingleAction(appId, rawAction) {
    return this.actionStorage.create(appId, rawAction);
  }

}
