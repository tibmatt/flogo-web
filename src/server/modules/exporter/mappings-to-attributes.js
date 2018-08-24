// The below constant must be in sync with the client side TYPE_LITERAL_ASSIGNMENT
// [src/client/flogo/flow/shared/mapper/constants.ts]
import {isSubflowTask} from "../../common/utils/subflow";
import {isMapperActivity} from "../../common/utils/flow";

const TYPE_LITERAL_ASSIGNMENT = 2;

export function mappingsToAttributes(task, schema) {
  if (schema && !isSubflowTask(task) && !isMapperActivity(schema)) {
    const attributes = [];
    const inputMappings = [];
    const taskMappings = task.inputMappings || [];
    taskMappings.forEach(mapping => {
      if (mapping.type === TYPE_LITERAL_ASSIGNMENT) {
        const attribute = schema.inputs.find(input => mapping.mapTo === input.name);
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
