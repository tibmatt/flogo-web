import cloneDeep from 'lodash/cloneDeep';
import { expect } from 'chai';

import { actionValueTypesNormalizer } from './action-value-type-normalizer';

describe('importer.common.actionValueTypesNormalizer', () => {

  const actionUnderTest = {
    metadata: {
      input: [
        { name: 'in1', type: 'any' },
        { name: 'in2', type: 'integer' },
        { name: 'in3', type: 'string' },
      ],
      output: [
        { name: 'out1', type: 'int' },
        { name: 'out2', type: 'long' },
      ],
    },
    tasks: [
      {
        id: 'task1',
        attributes: [
          { name: 'attr1', type: 'double' },
          { name: 'attr2', type: 'complex_object' },
        ],
      },
      {
        id: 'task2',
        attributes: [
          { name: 'attr1', type: 'number' },
          { name: 'attr2', type: 'complexObject' },
          { name: 'attr3', type: 'uknowntype' },
        ],
      },
    ],
    errorHandler: {
      tasks: [
        {
          id: 'task_error',
          attributes: [
            { name: 'attr1', type: 'array' },
            { name: 'attr2', type: 'params' },
            { name: 'attr3', type: 'int' },
          ],
        },
      ],
    }
  };
  const extractValues = arr => arr.map(({ name, type }) => ({ [name]: type }));
  let normalizedAction;

  beforeAll(function () {
    normalizedAction = actionValueTypesNormalizer(cloneDeep(actionUnderTest));
  });

  test('should correctly normalize metadata inputs and outputs', () => {
    const inputs = extractValues(normalizedAction.metadata.input);
    const outputs = extractValues(normalizedAction.metadata.output);
    expect(inputs).to.have.deep.members([
      { in1: 'any' },
      { in2: 'integer' },
      { in3: 'string' },
    ]);
    expect(outputs).to.have.deep.members([
      { out1: 'integer' },
      { out2: 'long' },
    ]);
  });

  test('should correctly normalize task value types for root task', () => {
    const taskAttributeTypes = extractTaskHandlerAttributeTypes('rootTask');
    const [task1Types, task2Types] = taskAttributeTypes;
    expect(task1Types).to.have.deep.members([
      { attr1: 'double' },
      { attr2: 'complexObject' },
    ]);
    expect(task2Types).to.have.deep.members([
      { attr1: 'double' },
      { attr2: 'complexObject' },
      { attr3: 'any' },
    ]);
  });

  test(
    'should correctly normalize task value types for error task',
    () => {
      const taskAttributeTypes = extractTaskHandlerAttributeTypes('errorHandler');
      const [taskTypes] = taskAttributeTypes;
      expect(taskTypes).to.have.deep.members([
        { attr1: 'array' },
        { attr2: 'params' },
        { attr3: 'integer' },
      ]);
    }
  );

  function extractTaskHandlerAttributeTypes(handlerName) {
    let handler;
    if (handlerName === 'rootTask') {
      handler = normalizedAction;
    } else {
      handler = normalizedAction[handlerName];
    }
    return handler.tasks.map(task => extractValues(task.attributes));
  }

});
