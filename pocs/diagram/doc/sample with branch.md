## Diagram (with branch)

```
task 1 -> task 2 -> task 3
     | -> task 4 -> task 5
```

### Presentation of Diagram 3 in graph

```javascript
// with branch
{
  "root": {
    "is": "1"
  },
  "nodes": {
    "1": {
      "id": "1",
      "taskID": "task 1",
      "type": "root",
      "children": [ "2", "b1" ],
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
      "children": [ ],
      "parents": [ "2" ]
    },
    "b1": {
      "id": "b1",
      "taskID": "",
      "type": "branch",
      "children": [ "4" ],
      "parents": [ "1" ]
    },
    "4": {
      "id": "4",
      "taskID": "task 4",
      "type": "task",
      "children": [ "5" ],
      "parents": [ "b1" ]
    },
    "5": {
      "id": "5",
      "taskID": "task 5",
      "type": "task",
      "children": [ ],
      "parents": [ "4" ]
    }
  }
}
```

### Presentation of Diagram 3 in matrix

```javascript
// diagram matrix
[
  [ "1", "2", "3" ],
  [ "b1", "4", "5" ]
]
```
