import isUndefined from 'lodash/isUndefined';
import isArray from 'lodash/isArray';
import { FLOGO_TASK_TYPE, REF_SUBFLOW } from '../../../common/constants';
import { isOutputMapperField } from '../../../common/utils/flow';
import { TASK_TYPE, EXPRESSION_TYPE } from '../../transfer/common/type-mapper';
import { parseResourceIdFromResourceUri } from './utils';
import { EXPR_PREFIX } from '@flogo-web/core';

export class StandardTaskConverter {
  private resourceTask;
  private activitySchema;
  static create(resourceTask, activitySchema): StandardTaskConverter {
    return new StandardTaskConverter(resourceTask, activitySchema);
  }

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
      settings.iterate = this.resourceTask.settings.iterate;
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
      inputs[mapping.mapTo] = EXPR_PREFIX + JSON.stringify(mapping.value);
      return inputs;
    }, inputMappings);
  }

  safeGetMappings() {
    const mappings = this.resourceTask.activity.mappings || {};
    const { input: resourceInputMappings = [] } = mappings;
    return resourceInputMappings;
  }

  convertAttributes() {
    const schemaInputs = this.activitySchema.inputs || [];
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
        attributes[schemaInput.name] = value;
      }
      return attributes;
    }, {});
  }
}
