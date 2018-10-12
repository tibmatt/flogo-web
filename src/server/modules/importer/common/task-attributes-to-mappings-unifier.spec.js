import cloneDeep from 'lodash/cloneDeep';
import {assert} from 'chai';
import {REF_SUBFLOW} from "../../../common/constants";
import {attributesToMappings, taskAttributesToMappingsUnifier} from "./task-attributes-to-mappings-unifier";

describe('importer.common.task-attributes-to-mappings-unifier', function() {
  const dataUnderTest = {
    action: {
      tasks: [
        {
          id: 'task1',
          activityRef: 'activityschema1',
          attributes: [
            { name: 'attr1', type: 'double' },
            { name: 'attr2', type: 'complex_object' },
          ],
          inputMappings: [{
            mapTo: 'attr1',
            type: 1,
            value: "$.flow.in1"
          }]
        },
        {
          id: 'task2',
          activityRef: 'activityschema2',
          attributes: [
            { name: 'attr1', type: 'number' },
            { name: 'attr2', type: 'complexObject' }
          ],
          inputMappings: [{
            mapTo: 'attr3',
            type: 2,
            value: true
          }]
        },
        {
          id: 'task3',
          activityRef: REF_SUBFLOW,
          attributes: [{ name: 'attr1', type: 'number' }],
          inputMappings: [{
            mapTo: 'attr1',
            type: 1,
            value: "$.flow.in1"
          }]
        },
        {
          id: 'task4',
          activityRef: 'activityschema3',
          attributes: [{ name: 'attr1', type: 'number' }],
          inputMappings: [{
            mapTo: 'attr3',
            type: 1,
            value: "$.flow.in2"
          }]
        }
      ]
    },
    schemas: [{
      ref: REF_SUBFLOW,
      inputs: [
        {
          name: 'mappings',
          type: 'array',
          required: true,
          display: {
            name: 'Mapper',
            type: 'mapper',
            mapperOutputScope: 'action.output'
          }
        }
      ]
    }, {
      ref: 'activityschema1',
      inputs: [
        {
          name: 'message',
          type: 'string',
          value: ''
        }
      ]
    }, {
      ref: 'activityschema2',
      inputs: [
        {
          name: 'message',
          type: 'string',
          value: ''
        }
      ]
    }, {
      ref: 'activityschema3',
      inputs: [
        {
          name: 'mappings',
          type: 'array',
          required: true,
          display: {
            name: 'Mapper',
            type: 'mapper',
            mapperOutputScope: 'action.output'
          }
        }
      ]
    }]
  };

  let resultAction;
  const extractMappings = (src, taskId) => src.tasks.find(task => task.id === taskId).inputMappings;
  beforeEach(() => {
    resultAction = taskAttributesToMappingsUnifier(cloneDeep(dataUnderTest.action), dataUnderTest.schemas);
  });

  it('Should unify the inputMappings for task1 as expected', function() {
    assert.deepEqual(extractMappings(resultAction, 'task1'), [{
      mapTo: 'attr1',
      type: 1,
      value: "$.flow.in1"
    }, {
      mapTo: 'attr2',
      type: 2,
      value: undefined
    }]);
  });

  it('Should unify the inputMappings for task2 as expected', function() {
    assert.deepEqual(extractMappings(resultAction, 'task2'), [ {
      mapTo: 'attr3',
      type: 2,
      value: true
    }, {
      mapTo: 'attr1',
      type: 2,
      value: undefined
    }, {
      mapTo: 'attr2',
      type: 2,
      value: undefined
    }]);
  });

  it('Should not process the unifier for task3 as it is a subflow', function() {
    assert.deepEqual(extractMappings(resultAction, 'task3'), extractMappings(dataUnderTest.action, 'task3'));
  });

  it('Should not process the unifier for task4 as it is a mapper', function() {
    assert.deepEqual(extractMappings(resultAction, 'task4'), extractMappings(dataUnderTest.action, 'task4'));
  });
});
