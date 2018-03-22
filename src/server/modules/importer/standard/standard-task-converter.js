import isUndefined from 'lodash/isUndefined';
import isArray from 'lodash/isArray';
import { FLOGO_TASK_TYPE, REF_SUBFLOW } from '../../../common/constants';
import { getDefaultValueByType } from '../../../common/utils';
import { isOutputMapperField } from '../../../common/utils/flow';
import { TASK_TYPE } from '../../transfer/common/type-mapper';
import { parseResourceIdFromResourceUri, portMappingType } from './utils';

export class StandardTaskConverter {

  /**
   * @static
   * @param resourceTask
   * @param activitySchema
   * @return {StandardTaskConverter}
   */
  static create(resourceTask, activitySchema) {
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
    this.resourceTask = resourceTask;
    this.activitySchema = activitySchema;
  }

  convert() {
    const { id, name, description, activity: { ref: activityRef } } = this.resourceTask;
    const { type, settings } = this.resolveTypeAndSettings();
    const inputMappings = this.convertInputMappings();
    const attributes = this.convertAttributes();
    return {
      id,
      name: name || id,
      description: description || '',
      type,
      activityRef,
      settings,
      attributes,
      inputMappings,
    };
  }

  resolveTypeAndSettings() {
    const settings = {};
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

  convertAttributes() {
    const schemaInputs = this.activitySchema.inputs || [];
    const activityInput = this.resourceTask.activity.input || {};
    return schemaInputs.map(schemaInput => {
      let value = activityInput[schemaInput.name];
      if (isUndefined(value)) {
        value = getDefaultValueByType(schemaInput.type);
      } else if (isOutputMapperField(schemaInput) && isArray(value)) {
        value = value.map(outputMapping => portMappingType(outputMapping));
      }
      return { ...schemaInput, value };
    });
  }

  convertInputMappings() {
    const mappings = this.resourceTask.activity.mappings || {};
    const { input: resourceInputMappings = [] } = mappings;
    return resourceInputMappings.map(mapping => portMappingType(mapping));
  }

}
