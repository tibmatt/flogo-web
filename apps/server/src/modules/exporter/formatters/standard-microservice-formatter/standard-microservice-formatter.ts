import isEmpty from 'lodash/isEmpty';
import { ResourceHooks, Resource, ResourceExportContext } from '@flogo-web/server/core';
import { ensureKeyOrder } from '../../../../common/utils/object';
import { formatHandler } from './format-handler';

const APP_MODEL_VERSION = '1.0.0';
const APP_KEY_ORDER = [
  'name',
  'type',
  'version',
  'appModel',
  'description',
  'properties',
  'triggers',
  'resources',
];
const TRIGGER_KEY_ORDER = ['id', 'ref', 'name', 'description', 'settings', 'handlers'];

export class StandardMicroServiceFormatter {
  constructor(
    private activitySchemas,
    private resolvePlugin: (resourceType: string) => ResourceHooks
  ) {}

  preprocess(app) {
    return app;
  }

  format(app) {
    app.appModel = APP_MODEL_VERSION;
    app.description = !isEmpty(app.description) ? app.description : undefined;

    const formattedTriggers = this.formatTriggers(app.triggers);
    app.triggers = !isEmpty(formattedTriggers) ? formattedTriggers : undefined;

    const resources = this.formatResources(app.actions);
    app.resources = !isEmpty(resources) ? resources : undefined;

    return ensureKeyOrder(app, APP_KEY_ORDER);
  }

  formatTriggers(triggers) {
    return triggers
      .filter(trigger => !isEmpty(trigger.handlers))
      .map(trigger => {
        const formattedTrigger = {
          ...trigger,
          handlers: trigger.handlers.map(formatHandler),
        };
        return ensureKeyOrder(formattedTrigger, TRIGGER_KEY_ORDER);
      });
  }

  async formatResources(resources: Resource[]) {
    const context: ResourceExportContext = {
      contributionSchemas: this.activitySchemas,
    };
    const getHooks = (resourceType: string) => {
      const hooks = this.resolvePlugin(resourceType);
      if (!hooks) {
        throw new Error(
          `Unknown resource type. Cannot export resource as type ${resourceType} is not registered`
        );
      }
      return hooks;
    };
    return Promise.all(
      resources.map(resource => getHooks(resource.type).beforeExport(resource, context))
    );
  }
}
