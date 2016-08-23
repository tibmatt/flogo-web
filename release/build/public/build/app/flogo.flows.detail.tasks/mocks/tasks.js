"use strict";
var constants_1 = require('../../../common/constants');
var utils_1 = require('../../../common/utils');
exports.MOCK_TASKS = [
    {
        "id": utils_1.flogoIDEncode("2"),
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Log Start",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "title": "Message",
                    "value": "Find Pet Process Started!"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "title": "Process info",
                    "value": "true"
                }
            ]
        }
    },
    {
        "id": utils_1.flogoIDEncode("3"),
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'rest',
        "name": "Pet Query",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "uri",
                    "title": "URI",
                    "value": "http://petstore.swagger.io/v2/pet/{petId}"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "method",
                    "title": "Method",
                    "value": "GET"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "petId",
                    "title": "Pet ID",
                    "value": "201603311111"
                }
            ],
            "outputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT,
                    "name": "result",
                    "title": "Result",
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
    {
        "id": utils_1.flogoIDEncode("4"),
        "type": constants_1.FLOGO_TASK_TYPE.TASK,
        "activityType": 'log',
        "name": "Log Results",
        "attributes": {
            "inputs": [
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
                    "name": "message",
                    "title": "Message",
                    "value": "REST results"
                },
                {
                    "type": constants_1.FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN,
                    "name": "processInfo",
                    "title": "Process Info",
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
];
