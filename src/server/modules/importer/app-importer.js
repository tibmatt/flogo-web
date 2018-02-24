import { cloneDeep } from 'lodash/cloneDeep';
import { ErrorManager } from '../../common/errors/index';

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
    const { errors: validationErrors, app: cleanApp } = this.validateAndCleanAdditionalProperties(rawApp);
    if (validationErrors && validationErrors.length > 0) {
      throw ErrorManager.createValidationError('Validation error', { details: validationErrors });
    }

    this.app = await this.appStorage.create(cleanApp);

    const actionsByOriginalId = await this.actionsImporter.importAll(this.rawData);

    this.triggerHandlersImporter.setAppId(actionsByOriginalId);
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
    const errors = this.fullAppValidator.validate(fullApp);
    return { app: fullApp, errors };
  }

}
