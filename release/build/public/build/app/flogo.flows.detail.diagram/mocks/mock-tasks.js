"use strict";
var constants_1 = require('../../../common/constants');
exports.TASKS = {
    "task 1": {
        "id": "task 1",
        "type": constants_1.FLOGO_TASK_TYPE.TASK_ROOT,
        "activityType": '',
        "name": "Trigger"
    },
    "task 2": {
        "id": "task 2",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Log Start",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        }
    },
    "task 3": {
        "id": "task 3",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'rest',
        "name": "Pet Query",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "uri",
                    "value": "http://petstore.swagger.io/v2/pet/{petId}"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "method",
                    "value": "GET"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "petId",
                    "value": ""
                }
            ],
            "outputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "result",
                    "value": ""
                }
            ]
        },
        "inputMappings": [
            {
                "type": 1,
                "value": "petId",
                "mapTo": "petId"
            }
        ],
        "outputMappings": [
            {
                "type": 1,
                "value": "result",
                "mapTo": "petInfo"
            }
        ]
    },
    "task 4": {
        "id": "task 4",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Log Results",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "REST results"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        },
        "inputMappings": [
            {
                "type": 1,
                "value": "petInfo",
                "mapTo": "message"
            }
        ]
    }
};
exports.TEST_TASKS = {
    "task 1": {
        "id": "task 1",
        "type": constants_1.FLOGO_TASK_TYPE.TASK_ROOT,
        "activityType": '',
        "name": "Trigger"
    },
    "task 2": {
        "id": "task 2",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Log Start",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        }
    },
    "task 3": {
        "id": "task 3",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'rest',
        "name": "Pet Query",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "uri",
                    "value": "http://petstore.swagger.io/v2/pet/{petId}"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "method",
                    "value": "GET"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "petId",
                    "value": ""
                }
            ],
            "outputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "result",
                    "value": ""
                }
            ]
        },
        "inputMappings": [
            {
                "type": 1,
                "value": "petId",
                "mapTo": "petId"
            }
        ],
        "outputMappings": [
            {
                "type": 1,
                "value": "result",
                "mapTo": "petInfo"
            }
        ]
    },
    "task 4": {
        "id": "task 4",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Log Results",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "REST results"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        },
        "inputMappings": [
            {
                "type": 1,
                "value": "petInfo",
                "mapTo": "message"
            }
        ]
    },
    "task 5": {
        "id": "task 5",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Task 5",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        }
    },
    "task 6": {
        "id": "task 6",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Task 6",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        }
    },
    "task 7": {
        "id": "task 7",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Task 7",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        }
    },
    "task 8": {
        "id": "task 8",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Task 8",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        }
    },
    "task 9": {
        "id": "task 9",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Task 9",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        }
    },
    "task a": {
        "id": "task a",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Task a",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        }
    },
    "task b": {
        "id": "task b",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Task b",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        }
    },
    "task c": {
        "id": "task c",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Task c",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        }
    },
    "task d": {
        "id": "task d",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Task d",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        }
    },
    "task e": {
        "id": "task e",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Task e",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        }
    },
    "task f": {
        "id": "task f",
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Task f",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "value": "true"
                }
            ]
        }
    }
};
