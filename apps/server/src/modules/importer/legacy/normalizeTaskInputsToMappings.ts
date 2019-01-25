import { Task } from '../../../interfaces';

export function normalizeTaskInputsToMappings(task: Task): Task {
  const EXPR_PREFIX = '=';
  let inputMappings = (task.attributes || []).reduce((mappings, attribute) => {
    mappings[attribute.name] = attribute.value;
    return mappings;
  }, {});
  inputMappings = (task.inputMappings || []).reduce((mappings, inputMapping) => {
    mappings[inputMapping.mapTo] = EXPR_PREFIX + JSON.stringify(inputMapping.value);
    return mappings;
  }, inputMappings);
  return {
    ...task,
    inputMappings,
  };
}
