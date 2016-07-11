"use strict";
var constants_1 = require('../../../common/constants');
var utils_1 = require('../../../common/utils');
exports.TRIGGERS = [
    {
        "id": utils_1.flogoIDEncode("1"),
        "type": constants_1.FLOGO_TASK_TYPE.TASK_ROOT,
        "activityType": '',
        "name": "HTTP Trigger",
        "settings": [
            {
                "name": "port",
                "type": "number"
            }
        ],
        "outputs": [
            {
                "name": "params",
                "type": "string"
            },
            {
                "name": "content",
                "type": "string"
            }
        ],
        "endpoint": {
            "settings": [
                {
                    "name": "method",
                    "type": "string"
                },
                {
                    "name": "path",
                    "type": "string"
                }
            ]
        }
    },
    {
        "id": utils_1.flogoIDEncode("1"),
        "type": constants_1.FLOGO_TASK_TYPE.TASK_ROOT,
        "activityType": '',
        "name": "MQTT Trigger"
    }
];
