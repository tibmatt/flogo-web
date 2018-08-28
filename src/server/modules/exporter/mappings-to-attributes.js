import cloneDeep from 'lodash/cloneDeep';
import {isSubflowTask} from "../../common/utils/subflow";
import {isMapperActivity} from "../../common/utils/flow";
import {TYPE_LITERAL_ASSIGNMENT} from "../../common/constants";

export function mappingsToAttributes(task, schema) {
  if (schema && !isSubflowTask(task) && !isMapperActivity(schema)) {
    const attributes = [];
    const inputMappings = [];
    const taskMappings = task.inputMappings || [];
    taskMappings.forEach(mapping => {
      if (mapping.type === TYPE_LITERAL_ASSIGNMENT) {
        const attribute = cloneDeep(schema.inputs.find(input => mapping.mapTo === input.name));
        attribute.value = mapping.value;
        attributes.push(attribute);
      } else {
        inputMappings.push(mapping);
      }
    });
    task.attributes = attributes;
    task.inputMappings = inputMappings;
  }
  return task;
}
