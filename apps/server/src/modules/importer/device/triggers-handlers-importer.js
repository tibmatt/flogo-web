import fromPairs from 'lodash/fromPairs';
import { getDefaultValueByType } from '../../../common/utils';
import { AbstractTriggersHandlersImporter } from '../common';

export class TriggersHandlersImporter extends AbstractTriggersHandlersImporter {
  constructor(triggerStorage, handlerStore, triggerSchemas) {
    super(triggerStorage, handlerStore);
    this.triggerSchemas = triggerSchemas;
  }

  extractHandlers(trigger) {
    return trigger.handlers;
  }

  extractTriggers(rawApp) {
    return (rawApp.triggers || []).map(trigger => this.formatTrigger(trigger));
  }

  formatTrigger(trigger) {
    trigger.settings = trigger.settings || [];
    return {
      ...trigger,
      settings: this.makeTriggerSettings(trigger),
      handlers: [
        {
          settings: {},
          actionId: trigger.actionId,
        },
      ],
    };
  }

  makeTriggerSettings(trigger) {
    return fromPairs(
      this.getSettingsSchema(trigger.ref).map(setting => [
        setting.name,
        trigger.settings[setting.name] || getDefaultValueByType(setting.type),
      ])
    );
  }

  getSettingsSchema(triggerRef) {
    return this.triggerSchemas.find(triggerSchema => triggerSchema.ref === triggerRef).settings || [];
  }
}
