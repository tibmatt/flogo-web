import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';

import { TASK_TYPE } from '../../../transfer/common/type-mapper';
import { isIterableTask } from '../../../../common/utils';
import { isOutputMapperField } from '../../../../common/utils/flow';
import { FLOGO_TASK_TYPE, REF_SUBFLOW } from '../../../../common/constants';

import { portAndFormatMappings } from './port-and-format-mappings';
import { createFlowUri } from './create-flow-uri';

export class TaskFormatter {

  setSourceTask(sourceTask) {
    this.sourceTask = sourceTask;
    return this;
  }

  setSchemaInputs(schemaInputs) {
    this.schemaInputsByName = keyBy(schemaInputs, 'name');
    return this;
  }

  convert() {
    const { id, name, description, activityRef } = this.sourceTask;
    const { type, taskSettings, activitySettings } = this.resolveTypeAndSettings();
    const mappings = this.convertInputMappings();
    const input = this.convertAttributes();
    return {
      id,
      type,
      name: !isEmpty(name) ? name : undefined,
      description: !isEmpty(description) ? description : undefined,
      settings: !isEmpty(taskSettings) ? taskSettings : undefined,
      activity: {
        ref: activityRef,
        input: !isEmpty(input) ? input : undefined,
        settings: !isEmpty(activitySettings) ? activitySettings : undefined,
        mappings: !isEmpty(mappings) ? mappings : undefined,
      },
    };
  }

  resolveTypeAndSettings() {
    const taskSettings = {};
    const activitySettings = {};
    // for type 'standard' we will omit the 'type' property as a task is 'standard' by default
    let type;
    if (this.isSubflowTask()) {
      activitySettings.flowURI = this.convertSubflowPath();
    }
    if (this.isIteratorTask()) {
      type = TASK_TYPE.ITERATOR;
      taskSettings.iterate = this.sourceTask.settings.iterate;
    }
    return { type, taskSettings, activitySettings };
  }

  convertSubflowPath() {
    const settings = this.sourceTask.settings;
    return createFlowUri(settings.flowPath);
  }

  isSubflowTask() {
    return this.sourceTask.activityRef === REF_SUBFLOW || this.sourceTask.type === FLOGO_TASK_TYPE.TASK_SUB_PROC;
  }

  isIteratorTask() {
    return isIterableTask(this.sourceTask);
  }

  convertAttributes() {
    // todo: for mapper classes need to convert input.mappings too
    const attributes = this.sourceTask.attributes || {};
    return attributes.reduce((input, attribute) => {
      let value = attribute.value;
      if (isOutputMapperField(this.schemaInputsByName[attribute.name]) && isArray(attribute.value)) {
        value = portAndFormatMappings({ output: value }).output;
      }
      input[attribute.name] = value;
      return input;
    }, {});
  }

  convertInputMappings() {
    return portAndFormatMappings(this.sourceTask.inputMappings || []);
  }
}
