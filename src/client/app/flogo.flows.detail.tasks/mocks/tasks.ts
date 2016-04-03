import { FLOGO_TASK_TYPE, FLOGO_ACTIVITY_TYPE, FLOGO_TASK_ATTRIBUTE_TYPE } from '../../../common/constants';

export var MOCK_TASKS = [
  {
    "id" : btoa( "2" ),
    "type" : FLOGO_TASK_TYPE.TASK,
    "activityType" : FLOGO_ACTIVITY_TYPE.LOG,
    "name" : "Log Start",
    "attributes" : {
      "inputs" : [
        {
          "type" : FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
          "name" : "message",
          "title" : "Message",
          "value" : "Find Pet Process Started!"
        },
        {
          "type" : FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
          "name" : "processInfo",
          "title" : "Process info",
          "value" : "true"
        }
      ]
    }
  },
  {
    "id" : btoa( "3" ),
    "type" : FLOGO_TASK_TYPE.TASK,
    "activityType" : FLOGO_ACTIVITY_TYPE.REST,
    "name" : "Pet Query",
    "attributes" : {
      "inputs" : [
        {
          "type" : FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
          "name" : "uri",
          "title" : "URI",
          "value" : "http://petstore.swagger.io/v2/pet/{petId}"
        },
        {
          "type" : FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
          "name" : "method",
          "title" : "Method",
          "value" : "GET"
        },
        {
          "type" : FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
          "name" : "petId",
          "title" : "Pet ID",
          "value" : "201603311111"
        }
      ],
      "outputs" : [
        {
          "type" : FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT,
          "name" : "result",
          "title" : "Result",
          "value" : ""
        }
      ]
    },
    "inputMappings" : [
      {
        "type" : 1,
        "value" : "petId",
        "mapTo" : "petId"
      }
    ],
    "outputMappings" : [
      {
        "type" : 1,
        "value" : "result",
        "mapTo" : "petInfo"
      }
    ]
  },
  {
    "id" : btoa( "4" ),
    "type" : FLOGO_TASK_TYPE.TASK,
    "activityType" : FLOGO_ACTIVITY_TYPE.LOG,
    "name" : "Log Results",
    "attributes" : {
      "inputs" : [
        {
          "type" : FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
          "name" : "message",
          "title" : "Message",
          "value" : "REST results"
        },
        {
          "type" : FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
          "name" : "processInfo",
          "title" : "Process Info",
          "value" : "true"
        }
      ]
    },
    "inputMappings" : [
      {
        "type" : 1,
        "value" : "petInfo",
        "mapTo" : "message"
      }
    ]
  }
];
