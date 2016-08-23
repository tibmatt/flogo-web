"use strict";
var constants_1 = require('../constants');
exports.DIAGRAM = {
    "root": {
        "is": "1"
    },
    "nodes": {
        "1": {
            "id": "1",
            "taskID": "task 1",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT,
            "children": ["2"],
            "parents": []
        },
        "2": {
            "id": "2",
            "taskID": "task 2",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": ["3"],
            "parents": ["1"]
        },
        "3": {
            "id": "3",
            "taskID": "task 3",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": ["4"],
            "parents": ["2"]
        },
        "4": {
            "id": "4",
            "taskID": "task 4",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": [],
            "parents": ["3"]
        }
    }
};
exports.TEST_DIAGRAM = {
    "root": {
        "is": "1"
    },
    "nodes": {
        "1": {
            "id": "1",
            "taskID": "task 1",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT,
            "children": [
                "2",
                "b1",
                "b2",
                "b3",
                "b4"
            ],
            "parents": []
        },
        "2": {
            "id": "2",
            "taskID": "task 2",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": ["3"],
            "parents": ["1"]
        },
        "3": {
            "id": "3",
            "taskID": "task 3",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": ["4"],
            "parents": ["2"]
        },
        "4": {
            "id": "4",
            "taskID": "task 4",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": [],
            "parents": [
                "3",
                "l1",
                "l2"
            ]
        },
        "5": {
            "id": "5",
            "taskID": "task 5",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": [
                "6",
                "b5"
            ],
            "parents": ["b1"]
        },
        "6": {
            "id": "6",
            "taskID": "task 6",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": [],
            "parents": ["5"]
        },
        "7": {
            "id": "7",
            "taskID": "task 7",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": [],
            "parents": ["b5"]
        },
        "8": {
            "id": "8",
            "taskID": "task 8",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": ["9"],
            "parents": ["b2"]
        },
        "9": {
            "id": "9",
            "taskID": "task 9",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": ["a"],
            "parents": ["8"]
        },
        "a": {
            "id": "a",
            "taskID": "task a",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": ["b"],
            "parents": ["9"]
        },
        "b": {
            "id": "b",
            "taskID": "task b",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": [],
            "parents": ["a"]
        },
        "c": {
            "id": "c",
            "taskID": "task c",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": ["d"],
            "parents": ["b3"]
        },
        "d": {
            "id": "d",
            "taskID": "task d",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": ["l1"],
            "parents": ["4"]
        },
        "e": {
            "id": "e",
            "taskID": "task e",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
            "children": ["l2"],
            "parents": ["b4"]
        },
        "b1": {
            "id": "b1",
            "taskID": "",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH,
            "children": ["5"],
            "parents": ["1"]
        },
        "b2": {
            "id": "b2",
            "taskID": "",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH,
            "children": ["8"],
            "parents": ["1"]
        },
        "b3": {
            "id": "b3",
            "taskID": "",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH,
            "children": ["c"],
            "parents": ["1"]
        },
        "b4": {
            "id": "b4",
            "taskID": "",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH,
            "children": ["e"],
            "parents": ["1"]
        },
        "b5": {
            "id": "b5",
            "taskID": "",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_BRANCH,
            "children": ["7"],
            "parents": ["5"]
        },
        "l1": {
            "id": "l1",
            "taskID": "",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_LINK,
            "children": ["4"],
            "parents": ["d"]
        },
        "l2": {
            "id": "l2",
            "taskID": "",
            "type": constants_1.FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_LINK,
            "children": ["4"],
            "parents": ["e"]
        }
    }
};
