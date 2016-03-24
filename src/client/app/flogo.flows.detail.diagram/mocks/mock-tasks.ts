import { IFlogoTaskDictionary, FLOGO_ACTIVITY_TYPE, FLOGO_TASK_TYPE, FLOGO_ATTRIBUTE_TYPE } from '../models';

export var TASKS: IFlogoTaskDictionary = {
  "task 1": {
    "id": "task 1",
    "type": FLOGO_TASK_TYPE.TASK_ROOT,
    "activityType": FLOGO_ACTIVITY_TYPE.DEFAULT,
    "name": "Trigger"
  },
  "task 2": {
    "id": "task 2",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Start",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "Find Pet Process Started!" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    }
  },
  "task 3": {
    "id": "task 3",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.REST,
    "name": "Pet Query",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "uri", "value": "http://petstore.swagger.io/v2/pet/{petId}" },
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "method", "value": "GET" },
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "petId", "value": "" }
      ],
      "outputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "result", "value": "" }
      ]
    },
    "inputMappings": [
      { "type": 1, "value": "petId", "mapTo": "petId" }
    ],
    "outputMappings": [
      { "type": 1, "value": "result", "mapTo": "petInfo" }
    ]
  },
  "task 4": {
    "id": "task 4",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Results",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "REST results" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    },
    "inputMappings": [
      { "type": 1, "value": "petInfo", "mapTo": "message" }
    ]
  }
};


export var TEST_TASKS: IFlogoTaskDictionary = {
  "task 1": {
    "id": "task 1",
    "type": FLOGO_TASK_TYPE.TASK_ROOT,
    "activityType": FLOGO_ACTIVITY_TYPE.DEFAULT,
    "name": "Trigger"
  },
  "task 2": {
    "id": "task 2",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Start",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "Find Pet Process Started!" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    }
  },
  "task 3": {
    "id": "task 3",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.REST,
    "name": "Pet Query",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "uri", "value": "http://petstore.swagger.io/v2/pet/{petId}" },
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "method", "value": "GET" },
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "petId", "value": "" }
      ],
      "outputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "result", "value": "" }
      ]
    },
    "inputMappings": [
      { "type": 1, "value": "petId", "mapTo": "petId" }
    ],
    "outputMappings": [
      { "type": 1, "value": "result", "mapTo": "petInfo" }
    ]
  },
  "task 4": {
    "id": "task 4",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Results",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "REST results" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    },
    "inputMappings": [
      { "type": 1, "value": "petInfo", "mapTo": "message" }
    ]
  },
  "task 5": {
    "id": "task 5",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Start",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "Find Pet Process Started!" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    }
  },
  "task 6": {
    "id": "task 6",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Start",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "Find Pet Process Started!" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    }
  },
  "task 7": {
    "id": "task 7",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Start",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "Find Pet Process Started!" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    }
  },
  "task 8": {
    "id": "task 8",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Start",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "Find Pet Process Started!" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    }
  },
  "task 9": {
    "id": "task 9",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Start",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "Find Pet Process Started!" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    }
  },
  "task a": {
    "id": "task a",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Start",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "Find Pet Process Started!" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    }
  },
  "task b": {
    "id": "task b",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Start",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "Find Pet Process Started!" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    }
  },
  "task c": {
    "id": "task c",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Start",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "Find Pet Process Started!" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    }
  },
  "task d": {
    "id": "task d",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Start",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "Find Pet Process Started!" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    }
  },
  "task e": {
    "id": "task e",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Start",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "Find Pet Process Started!" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    }
  },
  "task f": {
    "id": "task f",
    "type": FLOGO_TASK_TYPE.TASK,
    "activityType": FLOGO_ACTIVITY_TYPE.LOG,
    "name": "Log Start",
    "attributes": {
      "inputs": [
        { "type": FLOGO_ATTRIBUTE_TYPE.STRING, "name": "message", "value": "Find Pet Process Started!" },
        { "type": FLOGO_ATTRIBUTE_TYPE.BOOLEAN, "name": "processInfo", "value": "true" }
      ]
    }
  }
};
