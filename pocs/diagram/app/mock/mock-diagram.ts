import { FGDiagram, FGNodeType } from '../models';

export var DIAGRAM: FGDiagram = {
  // tasks
  // -------
  "root": {
    "is": "1"
  },
  "nodes": {
    "1": {
      "id": "1",
      "taskID": "task 1",
      "type": FGNodeType.ROOT,
      "children": [ "2" ],
      "parents": [ ]
    },
    "2": {
      "id": "2",
      "taskID": "task 2",
      "type": FGNodeType.TASK,
      "children": [ "3" ],
      "parents": [ "1" ]
    },
    "3": {
      "id": "3",
      "taskID": "task 3",
      "type": FGNodeType.TASK,
      "children": [ ],
      "parents": [ "2" ]
    }
  }
};

// export var DIAGRAM: FGDiagram = {
//   // tasks
//   // -------
//   "root": {
//     "is": "1"
//   },
//   "nodes": {
//     "1": {
//       "id": "1",
//       "taskID": "task 1",
//       "type": FGNodeType.ROOT,
//       "children": [ "2", "b1", "b2", "b3", "b4" ],
//       "parents": [ ]
//     },
//     "2": {
//       "id": "2",
//       "taskID": "task 2",
//       "type": FGNodeType.TASK,
//       "children": [ "3" ],
//       "parents": [ "1" ]
//     },
//     "3": {
//       "id": "3",
//       "taskID": "task 3",
//       "type": FGNodeType.TASK,
//       "children": [ "4" ],
//       "parents": [ "2" ]
//     },
//     "4": {
//       "id": "4",
//       "taskID": "task 4",
//       "type": FGNodeType.TASK,
//       "children": [ ],
//       "parents": [ "3", "l1", "l2" ]
//     },
//     "5": {
//       "id": "5",
//       "taskID": "task 5",
//       "type": FGNodeType.TASK,
//       "children": [ "6", "b5" ],
//       "parents": [ "b1" ]
//     },
//     "6": {
//       "id": "6",
//       "taskID": "task 6",
//       "type": FGNodeType.TASK,
//       "children": [ ],
//       "parents": [ "5" ]
//     },
//     "7": {
//       "id": "7",
//       "taskID": "task 7",
//       "type": FGNodeType.TASK,
//       "children": [ ],
//       "parents": [ "b5" ]
//     },
//     "8": {
//       "id": "8",
//       "taskID": "task 8",
//       "type": FGNodeType.TASK,
//       "children": [ "9" ],
//       "parents": [ "b2" ]
//     },
//     "9": {
//       "id": "9",
//       "taskID": "task 9",
//       "type": FGNodeType.TASK,
//       "children": [ "a" ],
//       "parents": [ "8" ]
//     },
//     "a": {
//       "id": "a",
//       "taskID": "task a",
//       "type": FGNodeType.TASK,
//       "children": [ "b" ],
//       "parents": [ "9" ]
//     },
//     "b": {
//       "id": "b",
//       "taskID": "task b",
//       "type": FGNodeType.TASK,
//       "children": [ ],
//       "parents": [ "a" ]
//     },
//     "c": {
//       "id": "c",
//       "taskID": "task c",
//       "type": FGNodeType.TASK,
//       "children": [ "d" ],
//       "parents": [ "b3" ]
//     },
//     "d": {
//       "id": "d",
//       "taskID": "task d",
//       "type": FGNodeType.TASK,
//       "children": [ "l1" ],
//       "parents": [ "4" ]
//     },
//     "e": {
//       "id": "e",
//       "taskID": "task e",
//       "type": FGNodeType.TASK,
//       "children": [ "l2" ],
//       "parents": [ "b4" ]
//     },
//     // branches
//     // -------
//     "b1": {
//       "id": "b1",
//       "taskID": "",
//       "type": FGNodeType.BRANCH,
//       "children": [ "5" ],
//       "parents": [ "1" ]
//     },
//     "b2": {
//       "id": "b2",
//       "taskID": "",
//       "type": FGNodeType.BRANCH,
//       "children": [ "8" ],
//       "parents": [ "1" ]
//     },
//     "b3": {
//       "id": "b3",
//       "taskID": "",
//       "type": FGNodeType.BRANCH,
//       "children": [ "c" ],
//       "parents": [ "1" ]
//     },
//     "b4": {
//       "id": "b4",
//       "taskID": "",
//       "type": FGNodeType.BRANCH,
//       "children": [ "e" ],
//       "parents": [ "1" ]
//     },
//     "b5": {
//       "id": "b5",
//       "taskID": "",
//       "type": FGNodeType.BRANCH,
//       "children": [ "7" ],
//       "parents": [ "5" ]
//     },
//     // links
//     // -------
//     "l1": {
//       "id": "l1",
//       "taskID": "",
//       "type": FGNodeType.LINK,
//       "children": [ "4" ],
//       "parents": [ "d" ]
//     },
//     "l2": {
//       "id": "l2",
//       "taskID": "",
//       "type": FGNodeType.LINK,
//       "children": [ "4" ],
//       "parents": [ "e" ]
//     }
//   }
// };

export var DIAGRAM1: FGDiagram = {
  "root": {
    "is": "1"
  },
  "nodes": {
    "1": {
      "id": "1",
      "taskID": "task 1",
      "type": FGNodeType.ROOT,
      "children": [ "2", "b1" ],
      "parents": [ ]
    },
    "2": {
      "id": "2",
      "taskID": "task 2",
      "type": FGNodeType.TASK,
      "children": [ "3" ],
      "parents": [ "1" ]
    },
    "3": {
      "id": "3",
      "taskID": "task 3",
      "type": FGNodeType.TASK,
      "children": [ ],
      "parents": [ "2" ]
    },
    "b1": {
      "id": "b1",
      "taskID": "",
      "type": FGNodeType.BRANCH,
      "children": [ "4" ],
      "parents": [ "1" ]
    },
    "4": {
      "id": "4",
      "taskID": "task 4",
      "type": FGNodeType.TASK,
      "children": [ "5" ],
      "parents": [ "b1" ]
    },
    "5": {
      "id": "5",
      "taskID": "task 5",
      "type": FGNodeType.TASK,
      "children": [ ],
      "parents": [ "4" ]
    }
  }
}
