## Diagram (with link)

```
task 1 -> task 2 -> task 3 -> task 4
     | -> task 5 -> task 6 -> [task 4]
```

### Presentation of Diagram 4 in graph

```javascript
// with link
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
    "4": {
      "id": "4",
      "taskID": "task 4",
      "type": "task",
      "children": [ ],
      "parents": [ "3" ]
    },
    "b1": {
      "id": "b1",
      "taskID": "",
      "type": "branch",
      "children": [ "5" ],
      "parents": [ "1" ]
    },
    "5": {
      "id": "5",
      "taskID": "task 5",
      "type": "task",
      "children": [ "6" ],
      "parents": [ "b1" ]
    },
    "6": {
      "id": "6",
      "taskID": "task 6",
      "type": "task",
      "children": [ "l1" ],
      "parents": [ "4" ]
    },
    "l1": {
      "id": "l1",
      "taskID": "",
      "type": "link",
      "children": [ "4" ],
      "parents": [ "6" ]
    }
  }
}
```

### Presentation of Diagram 4 in matrix

```javascript
// diagram matrix
[
  [ "1", "2", "3", "4" ],
  [ "b1", "5", "6", "l1" ]
]
```
