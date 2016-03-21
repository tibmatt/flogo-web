{
  id: '',
  type: '', // root, task, link, branch, sub-flow, sub-flow-loop
  sub: [ ], // TODO the sub tasks inside a sub-flow OPTIONAL
  children: [ ],
  parents: [ ]
}

// diagram

// single path
{
  id: '1',
  type: 'root',
  children: [ {
    id: '2',
    type: 'task',
    children: [ {
      id: '3',
      type: 'task',
      children: [ {
        id: '4',
        type: 'task',
        children: [ {
          id: '5',
          type: 'task',
          children: [ {
            id: '6',
            type: 'task',
            children: [ ],
            parents: [ '5' ]
          } ],
          parents: [ '4' ]
        } ],
        parents: [ '3' ]
      } ],
      parents: [ '2' ]
    } ],
    parents: [ '1' ]
  } ],
  parents: [ ]
}

// single path with sub-task

{
  id: '1',
  type: 'root',
  children: [ {
    id: '2',
    type: 'task',
    children: [ {
      id: '3',
      type: 'sub-flow-loop',
      sub: [ {
        id: '2',
        type: 'task',
        children: [ {
          id: '3',
          type: 'task',
          children: [ ],
          parents: [ '2' ]
        } ],
        parents: [ ]
      } ],
      children: [ {
        id: '4',
        type: 'task',
        children: [ {
          id: '5',
          type: 'task',
          children: [ {
            id: '6',
            type: 'task',
            children: [ ],
            parents: [ '5' ]
          } ],
          parents: [ '4' ]
        } ],
        parents: [ '3' ]
      } ],
      parents: [ '2' ]
    } ],
    parents: [ '1' ]
  } ],
  parents: [ ]
}

// path with branch

{
  id: '1',
  type: 'root',
  children: [ {
    id: '11',
    type: 'branch',
    children: [ {
      id: '2',
      type: 'task',
      children: [ {
        id: '3',
        type: 'task',
        children: [ {
          id: '4',
          type: 'link',
          children: [ {
            id: '5',
            type: 'task',
            children: [ {
              id: '6',
              type: 'task',
              children: [ ],
              parents: [ '5' ]
            } ],
            parents: [ '4' ]
          } ],
          parents: [ '3' ]
        } ],
        parents: [ '2' ]
      } ],
      parents: [ '1' ]
    }, {
      id: '2',
      type: 'task',
      children: [ {
        id: '3',
        type: 'task',
        children: [ ],
        parents: [ '2' ]
      } ],
      parents: [ '1' ]
    } ]
  } ],
  parents: [ ]
}

