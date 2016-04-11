/**
 * Events published from this module
 */

export const PUB_EVENTS = {
  addTask : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'add-task'
  },
  selectTask : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'select-task'
  },
  addTrigger : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'add-trigger'
  },
  selectTrigger : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'select-trigger'
  },
  addBranch : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'add-branch'
  },
  selectTransform : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'select-transform'
  },
  deleteTask : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'delete-task'
  }
};

/**
 * Events subscribed by this module
 */

export const SUB_EVENTS = {
  addTask : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'public-add-task'
  },
  selectTask : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'public-select-task'
  },
  addTrigger : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'public-add-trigger'
  },
  selectTrigger : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'public-select-trigger'
  },
  render: {
    channel : 'flogo-flows-detail-diagram',
    topic : 'public-render'
  },
  addBranch : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'public-add-branch'
  },
  selectTransform : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'public-select-transform'
  },
  deleteTask : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'public-delete-task'
  }
};
