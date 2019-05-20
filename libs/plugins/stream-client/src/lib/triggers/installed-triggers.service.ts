import { map, get, assign, each, isUndefined } from 'lodash';
import { Injectable } from '@angular/core';

import { TriggerSchema } from '@flogo-web/core';
import {
  ContributionsService,
  FLOGO_CONTRIB_TYPE,
  getDefaultValue,
  ErrorService,
} from '@flogo-web/lib-client/core';

@Injectable()
export class InstalledTriggersService {
  constructor(
    private contribService: ContributionsService,
    private errorService: ErrorService
  ) {}

  getTriggers() {
    return this.contribService.listContribs(FLOGO_CONTRIB_TYPE.TRIGGER).then(response => {
      const data = response || [];
      return map(data, (trigger: any) => {
        return activitySchemaToTrigger(trigger);
      });
    });
  }

  getTriggerSchema(trigger) {
    if (!trigger.ref) {
      throw this.errorService.makeOperationalError(
        'Trigger: Wrong input json file',
        'Cannot get ref for trigger',
        {
          type: 'ValidationError',
          title: 'Wrong input json file',
          detail: 'Cannot get ref for trigger:',
          property: 'trigger',
          value: trigger,
        }
      );
    } else {
      return this.contribService
        .getContributionDetails(trigger.ref)
        .then((schema: TriggerSchema) => this.normalizeTriggerSchema(schema));
    }
  }

  private normalizeTriggerSchema(schema: TriggerSchema): TriggerSchema {
    if (!schema.handler) {
      schema.handler = {
        settings: [],
      };
    }
    return schema;
  }
}

export function portAttribute(
  inAttr: {
    type: string;
    value: any;
    [key: string]: any;
  },
  withDefault = false
) {
  const outAttr = <
    {
      type: any;
      value: any;
      [key: string]: any;
    }
  >assign({}, inAttr);

  if (withDefault && isUndefined(outAttr.value)) {
    outAttr.value = getDefaultValue(outAttr.type);
  }

  return outAttr;
}

export function activitySchemaToTrigger(schema: any): any {
  const trigger: any = {
    type: 0,
    triggerType: get(schema, 'name', ''),
    ref: schema.ref,
    name: get(schema, 'title', get(schema, 'name', 'Activity')),
    version: get(schema, 'version', ''),
    description: get(schema, 'description', ''),
    homepage: get(schema, 'homepage', ''),
    settings: get(schema, 'settings', ''),
    outputs: get(schema, 'outputs', ''),
    handler: { settings: get(schema, 'handler.settings', []) }, // ,
    // __schema: cloneDeep(schema)
  };

  each(trigger.inputs, (input: any) => {
    // convert to task enumeration and provision default types
    assign(input, portAttribute(input, true));
  });

  each(trigger.outputs, (output: any) => {
    // convert to task enumeration and provision default types
    assign(output, portAttribute(output));
  });

  return trigger;
}
