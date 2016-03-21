## Diagram (complex sample)

```
task 1 -> task 2 -> task 3 -> task 4
     | -> task 5 -> task 6
     		   | -> task 7
     | -> task 8 -> task 9 -> task a -> task b
     | -> task c -> task d -> [task 4]
     | -> task e -> [task 4]
```

### Presentation of Diagram 5 in graph

```javascript
// the sample
{
  // tasks
  // -------
  "root": {
    "is": "1"
  },
  "nodes": {
    "1": {
      "id": "1",
      "taskID": "task 1",
      "type": "root",
      "children": [ "2", "b1", "b2", "b3", "b4" ],
      "parents": [ ]
    },
    "2": {
      "id": "2",
      "taskID": "task 2",
      "type": "task",
      "children": [ "3" ],
      "parents": [ "1" ]
    },
    "3": {
      "id": "3",
      "taskID": "task 3",
      "type": "task",
      "children": [ "4" ],
      "parents": [ "2" ]
    },
    "4": {
      "id": "4",
      "taskID": "task 4",
      "type": "task",
      "children": [ ],
      "parents": [ "3", "l1", "l2" ]
    },
    "5": {
      "id": "5",
      "taskID": "task 5",
      "type": "task",
      "children": [ "6", "b5" ],
      "parents": [ "b1" ]
    },
    "6": {
      "id": "6",
      "taskID": "task 6",
      "type": "task",
      "children": [ ],
      "parents": [ "5" ]
    },
    "7": {
      "id": "7",
      "taskID": "task 7",
      "type": "task",
      "children": [ ],
      "parents": [ "b5" ]
    },
    "8": {
      "id": "8",
      "taskID": "task 8",
      "type": "task",
      "children": [ "9" ],
      "parents": [ "b2" ]
    },
    "9": {
      "id": "9",
      "taskID": "task 9",
      "type": "task",
      "children": [ "a" ],
      "parents": [ "8" ]
    },
    "a": {
      "id": "a",
      "taskID": "task a",
      "type": "task",
      "children": [ "b" ],
      "parents": [ "9" ]
    },
    "b": {
      "id": "b",
      "taskID": "task b",
      "type": "task",
      "children": [ ],
      "parents": [ "a" ]
    },
    "c": {
      "id": "c",
      "taskID": "task c",
      "type": "task",
      "children": [ "d" ],
      "parents": [ "b3" ]
    },
    "d": {
      "id": "d",
      "taskID": "task d",
      "type": "task",
      "children": [ "l1" ],
      "parents": [ "4" ]
    },
    "e": {
      "id": "e",
      "taskID": "task e",
      "type": "task",
      "children": [ "l2" ],
      "parents": [ "b4" ]
    },
    // branches
    // -------
    "b1": {
      "id": "b1",
      "taskID": "",
      "type": "branch",
      "children": [ "5" ],
      "parents": [ "1" ]
    },
    "b2": {
      "id": "b2",
      "taskID": "",
      "type": "branch",
      "children": [ "8" ],
      "parents": [ "1" ]
    },
    "b3": {
      "id": "b3",
      "taskID": "",
      "type": "branch",
      "children": [ "c" ],
      "parents": [ "1" ]
    },
    "b4": {
      "id": "b4",
      "taskID": "",
      "type": "branch",
      "children": [ "e" ],
      "parents": [ "1" ]
    },
    "b5": {
      "id": "b5",
      "taskID": "",
      "type": "branch",
      "children": [ "7" ],
      "parents": [ "5" ]
    },
    // links
    // -------
    "l1": {
      "id": "l1",
      "taskID": "",
      "type": "link",
      "children": [ "4" ],
      "parents": [ "6" ]
    },
    "l2": {
      "id": "l2",
      "taskID": "",
      "type": "link",
      "children": [ "4" ],
      "parents": [ "e" ]
    }
  }
}
```

### Presentation of Diagram 5 in matrix

```javascript
// diagram matrix
[
  [ "1", "2", "3", "4" ],
  [ "b1", "5", "6" ],
  [ "b5", "7" ],
  [ "b2", "8", "9", "a", "b" ],
  [ "b3", "c", "d", "l1" ],
  [ "b4", "e", "l2" ]
]
```
