"use strict";
exports.PROCESS = {
    "id": "demo_process",
    "name": "Demo Process",
    "description": "The Demo Test Process",
    "process": {
        "type": 1,
        "name": "Demo Process",
        "model": "simple",
        "attributes": [
            {
                "name": "petInfo",
                "type": "string",
                "value": ""
            }
        ],
        "rootTask": {
            "id": 1,
            "type": 1,
            "activityType": "",
            "name": "root",
            "tasks": [
                {
                    "id": 2,
                    "type": 1,
                    "activityType": "log",
                    "name": "Log Start",
                    "attributes": [
                        {
                            "type": "string",
                            "name": "message",
                            "value": "Find Pet Process Started!"
                        },
                        {
                            "type": "boolean",
                            "name": "processInfo",
                            "value": "true"
                        }
                    ]
                },
                {
                    "id": 3,
                    "type": 1,
                    "activityType": "rest",
                    "name": "Pet Query",
                    "attributes": [
                        {
                            "type": "string",
                            "name": "uri",
                            "value": "http://petstore.swagger.io/v2/pet/{petId}"
                        },
                        {
                            "type": "string",
                            "name": "method",
                            "value": "GET"
                        },
                        {
                            "type": "string",
                            "name": "petId",
                            "value": ""
                        },
                        {
                            "type": "string",
                            "name": "result",
                            "value": ""
                        }
                    ],
                    "inputMappings": [
                        {
                            "type": 1,
                            "value": "petId",
                            "mapTo": "petId"
                        }
                    ],
                    "ouputMappings": [
                        {
                            "type": 1,
                            "value": "result",
                            "mapTo": "petInfo"
                        }
                    ]
                },
                {
                    "id": 4,
                    "type": 1,
                    "activityType": "log",
                    "name": "Log Results",
                    "attributes": [
                        {
                            "type": "string",
                            "name": "message",
                            "value": "REST results"
                        },
                        {
                            "type": "boolean",
                            "name": "processInfo",
                            "value": "true"
                        }
                    ],
                    "inputMappings": [
                        {
                            "type": 1,
                            "value": "petInfo",
                            "mapTo": "message"
                        }
                    ]
                }
            ],
            "links": [
                {
                    "id": 1,
                    "type": 1,
                    "name": "",
                    "to": 3,
                    "from": 2
                },
                {
                    "id": 2,
                    "type": 1,
                    "name": "",
                    "to": 4,
                    "from": 3
                }
            ]
        }
    }
};
