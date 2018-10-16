import { keyBy, isEmpty } from 'lodash';
import {flow as backendFlow, SchemaAttribute, BaseItemTask} from '@flogo/core';

export function mergeConfigurationsWithSchema(configurations: BaseItemTask['input'] = {},
                                              schemaInputs: SchemaAttribute[] = []): backendFlow.TestConfig[] {
  if (isEmpty(configurations)) {
    return undefined;
  }
  const inputsDictionary = keyBy(schemaInputs, 'name');
  return Object.keys(configurations).reduce((testConfigurations, name) => {
    testConfigurations.push({
      name,
      value: configurations[name],
      type: inputsDictionary[name].type
    });
    return testConfigurations;
  }, []);
}
