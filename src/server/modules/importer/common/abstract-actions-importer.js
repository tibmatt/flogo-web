
export class AbstractActionsImporter {
  constructor(actionStorage) {
    this.actionStorage = actionStorage;
  }

  // eslint-disable-next-line no-unused-vars
  extractActions(fromRawApp) {
    throw new Error('You have to implement the method extractActions!');
  }

  async importAll(appId, fromRawApp) {
    const rawActions = this.extractActions(fromRawApp);
    const actionPairs = await this.storeActions(appId, rawActions);
    return new Map(actionPairs);
  }

  async storeActions(appId, rawActions = []) {
    const actionPromises = rawActions.map(async rawAction => {
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
