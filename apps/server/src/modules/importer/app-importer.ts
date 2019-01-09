import cloneDeep from 'lodash/cloneDeep';
import { App } from '../../interfaces';
import { AbstractActionsImporter, AbstractTriggersHandlersImporter } from './common';

export class AppImporter {
  private rawData: any;
  private app: App;
  constructor(
    private fullAppValidator: { validate: (a: any) => any[] },
    private appStorage: { create: (app) => Promise<any> },
    private actionsImporter: AbstractActionsImporter,
    private triggerHandlersImporter: AbstractTriggersHandlersImporter
  ) {}

  async import(value) {
    this.rawData = value;
    const rawApp = cloneDeep(value);

    this.validateAndCleanAdditionalProperties(rawApp);

    this.app = await this.appStorage.create(rawApp);

    const actionsByOriginalId = await this.actionsImporter.importAll(
      this.app.id,
      this.rawData
    );

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
