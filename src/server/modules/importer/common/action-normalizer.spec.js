import cloneDeep from 'lodash/cloneDeep';
import { expect } from 'chai';

import { actionNormalizer } from './action-normalizer';

describe('importer.common.actionNormalizer', function () {

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
    links: [
      {
        from: 'task_1',
        to: 'task_2'
      }, {
        from: 'task_1',
        to: 'task_3',
        type: 'expression',
        value: '$flow.in'
      }, {
        from: 'task_2',
        to: 'task_4'
      },
    ],
    errorHandler: {
      tasks: [
        {
          id: 'task_error',
          attributes: [
            {name: 'attr1', type: 'array'},
            {name: 'attr2', type: 'params'},
            {name: 'attr3', type: 'int'},
          ],
        },
      ],
      links: [
        {
          from: 'task_1',
          to: 'task_2'
        }, {
          from: 'task_1',
          to: 'task_3'
        },
      ]
    }
  };
  const extractValues = arr => arr.map(({ name, type }) => ({ [name]: type }));
  let normalizedAction;

  before(function () {
    normalizedAction = actionNormalizer(cloneDeep(actionUnderTest));
  });

  it('should correctly normalize metadata inputs and outputs', function () {
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

  it('should correctly normalize task value types for root task', function () {
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

  it('should correctly normalize task value types for error task', function () {
    const taskAttributeTypes = extractTaskHandlerAttributeTypes('errorHandler');
    const [taskTypes] = taskAttributeTypes;
    expect(taskTypes).to.have.deep.members([
      { attr1: 'array' },
      { attr2: 'params' },
      { attr3: 'integer' },
    ]);
  });

  it('should create main branch link properly for main task', () => {
    const rootLinks = extractLinksForHandler('rootTask');
    expect(rootLinks).to.have.deep.members([
      {
        from: 'task_1',
        to: 'task_2',
        type: 3
      }, {
        from: 'task_1',
        to: 'task_3',
        type: 1,
        value: '$flow.in'
      }, {
        from: 'task_2',
        to: 'task_4'
      }
    ]);
  });

  it('should create main branch link properly for error task', () => {
    const errorHandlerLinks = extractLinksForHandler('errorHandler');
    expect(errorHandlerLinks).to.have.deep.members([
      {
        from: 'task_1',
        to: 'task_2',
        type: 3
      }, {
        from: 'task_1',
        to: 'task_3',
        type: 1
      }
    ]);
  });

  function extractTaskHandlerAttributeTypes(handlerName) {
    let handler;
    if (handlerName === 'rootTask') {
      handler = normalizedAction;
    } else {
      handler = normalizedAction[handlerName];
    }
    return handler.tasks.map(task => extractValues(task.attributes));
  }

  function extractLinksForHandler(handlerName) {
    let handler;
    if (handlerName === 'rootTask') {
      handler = normalizedAction;
    } else {
      handler = normalizedAction[handlerName];
    }
    return handler.links;
  }

});
