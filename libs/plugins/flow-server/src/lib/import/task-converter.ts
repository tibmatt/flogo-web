import { isUndefined, isArray, isPlainObject } from 'lodash';

import { EXPR_PREFIX } from '@flogo-web/core';
import {
  REF_SUBFLOW,
  FLOGO_TASK_TYPE,
  TASK_TYPE,
  EXPRESSION_TYPE,
  parseResourceIdFromResourceUri,
} from '@flogo-web/server/core';
import { isOutputMapperField } from '@flogo-web/plugins/flow-core';
import { normalizeIteratorValue } from './normalize-iterator-value';

export class TaskConverter {
  private resourceTask;
  private activitySchema;

  constructor(resourceTask, activitySchema) {
    if (!resourceTask) {
      throw new TypeError('Missing parameter: resourceTask');
    }
    if (!activitySchema) {
      throw new TypeError('Missing parameter: activitySchema');
    }
    this.resourceTask = resourceTask;
    this.activitySchema = activitySchema;
  }

  convert() {
    const {
      id,
      name,
      description,
      activity: { ref: activityRef },
    } = this.resourceTask;
    const { type, settings } = this.resolveTypeAndSettings();
    const inputMappings = this.prepareInputMappings();
    return {
      id,
      name: name || id,
      description: description || '',
      type,
      activityRef,
      settings,
      inputMappings,
    };
  }

  resolveTypeAndSettings() {
    const settings: { [key: string]: any } = {};
    let type = FLOGO_TASK_TYPE.TASK;
    if (this.isSubflowTask()) {
      type = FLOGO_TASK_TYPE.TASK_SUB_PROC;
      settings.flowPath = this.extractSubflowPath();
    }
    if (this.isIteratorTask()) {
      settings.iterate = normalizeIteratorValue(this.resourceTask.settings.iterate);
    }
    return { type, settings };
  }

  extractSubflowPath() {
    const activitySettings = this.resourceTask.activity.settings;
    return parseResourceIdFromResourceUri(activitySettings.flowURI);
  }

  isSubflowTask() {
    return this.resourceTask.activity.ref === REF_SUBFLOW;
  }

  isIteratorTask() {
    return this.resourceTask.type === TASK_TYPE.ITERATOR;
  }

  prepareInputMappings() {
    const inputMappings = this.convertAttributes();
    return this.safeGetMappings().reduce((inputs, mapping) => {
      let value = mapping.value;
      if (isPlainObject(value)) {
        value = EXPR_PREFIX + JSON.stringify(value, null, 2);
      } else if (mapping.type !== EXPRESSION_TYPE.LITERAL) {
        value = EXPR_PREFIX + value;
      }
      inputs[mapping.mapTo] = value;
      return inputs;
    }, inputMappings);
  }

  safeGetMappings() {
    const mappings = this.resourceTask.activity.mappings || {};
    const { input: resourceInputMappings = [] } = mappings;
    return resourceInputMappings;
  }

  convertAttributes() {
    // in the past schema used name `inputs` but now uses `input`, server model was using inputs
    // todo: fcastill - support input only
    const schemaInputs = this.activitySchema.input || this.activitySchema.inputs || [];
    const activityInput = this.resourceTask.activity.input || {};
    return schemaInputs.reduce((attributes, schemaInput) => {
      let value = activityInput[schemaInput.name];
      if (isUndefined(value)) {
        return attributes;
      }
      if (isOutputMapperField(schemaInput) && isArray(value)) {
        value = value.reduce((mapping, outputMapping) => {
          mapping[outputMapping.mapTo] =
            outputMapping.type !== EXPRESSION_TYPE.LITERAL
              ? EXPR_PREFIX + outputMapping.value
              : outputMapping.value;
          return mapping;
        }, {});
        return { ...attributes, ...value };
      } else {
        attributes[schemaInput.name] = isPlainObject(value)
          ? EXPR_PREFIX + JSON.stringify(value, null, 2)
          : value;
      }
      return attributes;
    }, {});
  }
}
