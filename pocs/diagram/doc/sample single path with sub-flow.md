## Diagram (single path with sub-flow)

```
task 1 -> task 2 -> task 3
			|
			| -> sub-task 1 -> sub-task 2  // invisible in diagram
```

### Presentation of Diagram 2 in graph

```javascript
// single graph with sub-flow
{
  "root": {
    "is": "1"
  },
  "nodes": {
    "1": {
      "id": "1",
      "taskID": "task 1",
      "type": "root",
      "children": [ "2" ],
      "parents": [ ]
    },
    "2": {
      "id": "2",
      "taskID": "task 2",
      "type": "sub-flow",
      "children": [ "3" ],
      "parents": [ "1" ],
      "subflow": [ {
        "root": {
          "is": "s1"
        }
      } ]
    },
    "3": {
      "id": "3",
      "taskID": "task 3",
      "type": "task",
      "children": [ ],
      "parents": [ "2" ]
    },
    "s1": {
      "id": "s1",
      "taskID": "sub-task 1",
      "type": "root",
      "children": [ "s2" ],
      "parents": [ ]
    },
    "s2": {
      "id": "s2",
      "taskID": "sub-task 2",
      "type": "task",
      "children": [ ],
      "parents": [ "s1" ]
    }
  }
}
```

### Presentation of Diagram 2 in matrix__

```javascript
// diagram matrix
[
  [ "1", "2", "3" ]
]

// task 2 matrix
[
  [ "s1", "s2" ]
]
```
