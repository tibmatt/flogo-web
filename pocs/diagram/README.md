__Table of Contents__

<!-- MarkdownTOC -->

- [Diagram](#diagram)
- [Grid](#grid)
- [Data Structures](#data-structures)
  - [Task Specification](#task-specification)
    - [Individual Task](#individual-task)
    - [Tasks Dictionary](#tasks-dictionary)
  - [Diagram Node](#diagram-node)
  - [Diagram Graph](#diagram-graph)
    - [Diagram 1 (single path)](#diagram-1-single-path)

<!-- /MarkdownTOC -->

<a name="diagram"></a>
## Diagram

```
task 1 -> task 2 -> task 3 -> task 4
	 | -> task 5 -> task 6 -> task 7
	 | -> task 8 -> task 9 -> task a -> task b
	 | -> task c -> task d -> [task 4]
	 | -> task e -> [task 4]
```

<a name="grid"></a>
## Grid

```
// `..` is a branch node
// `|t4` is the link node linking to task t4
[
	[t1, t2, t3, t4],
	[.., t5, t6, t7],
	[.., t8, t9, ta, tb],
	[.., tc, td, |t4],
	[.., te, |t4]
]
```

<a name="data-structures"></a>
## Data Structures

<a name="task-specification"></a>
### Task Specification

<a name="individual-task"></a>
#### Individual Task

```javascript
{
  "id": "1", // task ID in string, should be unique.
  "name": "task name", // task name
  "attrs": {
    "inputs": {
      "<parameter name>": "<parameter value>"
    },
    "outputs": {
      "<parameter name>": "<parameter value>"
    }
  }
}
```

<a name="tasks-dictionary"></a>
#### Tasks Dictionary

```javascript
{
  "1": {
    "id": "1",
    "name": "task name",
    "attrs": {
      "inputs": {
        "<parameter name>": "<parameter value>"
      },
      "outputs": {
        "<parameter name>": "<parameter value>"
      }
    }
  },
  "taskid": {
    "id": "taskid",
    "name": "task name",
    "attrs": {
      "inputs": {
        "<parameter name>": "<parameter value>"
      },
      "outputs": {
        "<parameter name>": "<parameter value>"
      }
    }
  }
}
```

<a name="diagram-node"></a>
### Diagram Node

```javascript
// base node
{
  "id": "node id",
  "taskID": "task id",
  "type": "root", // root, task, link, branch, sub-flow, task-loop
  "children": [ ],
  "parents": [ ]
}

// type link & branch
{
  "id": "node id",
  "taskID": "", // always empty
  "type": "link" || "branch",
  "children": [ ], // single child for link & branch
  "parents": [ ] // single parent for link & branch
}

// type sub-flow & task-loop
{
  "id": "node id",
  "taskID": "task id",
  "type": "sub-flow" || "task-loop",
  "children": [ ],
  "parents": [ ],
  // -------
  "subflow": [ {
    // another graph
  } ]
}

// type root & task are the same as base node
// ...

```

_NOTE_ restrictions:

* The children of a node should contain at least one and only one non-branch node
* The the children of the parents of a non-branch node should only be branch nodes

<a name="diagram-graph"></a>
### Diagram Graph

more samples could be found in `./doc` folder

<a name="diagram-1-single-path"></a>
#### Diagram 1 (single path)

```
task 1 -> task 2 -> task 3
```

__Presentation of Diagram 1 in graph__

```javascript
// single graph
{
  "root": {
    "is": "1"
  },
  nodes: {
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
    }
  }
}
```

__Presentation of Diagram 1 in matrix__

```javascript
[
  [ "1", "2", "3" ]
]
```
