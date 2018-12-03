import cloneDeep from 'lodash/cloneDeep';

export class AppImporter {
  /**
   * @param {{ validate: function(object) }} fullAppValidator
   * @param {{ create: Function(object):Promise }} appStorage
   * @param {ActionsImporter} actionsImporter
   * @param {TriggersHandlersImporter} triggerHandlersImporter
   */
  constructor(fullAppValidator, appStorage, actionsImporter, triggerHandlersImporter) {
    this.fullAppValidator = fullAppValidator;
    this.appStorage = appStorage;
    this.actionsImporter = actionsImporter;
    this.triggerHandlersImporter = triggerHandlersImporter;
  }

  async import(value) {
    this.rawData = value;
    const rawApp = cloneDeep(value);

    this.validateAndCleanAdditionalProperties(rawApp);

    this.app = await this.appStorage.create(rawApp);

    const actionsByOriginalId = await this.actionsImporter.importAll(this.app.id, this.rawData);

    this.triggerHandlersImporter.setAppId(this.app.id);
    this.triggerHandlersImporter.setActionsByOriginalId(actionsByOriginalId);
    await this.triggerHandlersImporter.importAll(this.rawData);

    return this.app;
  }

  /**
   *
   * @param fullApp
   * @return {{app: *, errors: Array}}
   */
  validateAndCleanAdditionalProperties(fullApp) {
    this.fullAppValidator.validate(fullApp);
    return fullApp;
  }
}
