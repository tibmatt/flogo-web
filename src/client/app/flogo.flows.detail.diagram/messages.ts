/**
 * Events published from this module
 */

export const PUB_EVENTS = {
  addTask : {
    channel : 'mock-flogo-flows-detail-diagram',
    topic : 'add-task'
  },
  selectTask : {
    channel : 'mock-flogo-flows-detail-diagram',
    topic : 'select-task'
  },
  addTrigger : {
    channel : 'mock-flogo-flows-detail-diagram',
    topic : 'add-trigger'
  },
  selectTrigger : {
    channel : 'mock-flogo-flows-detail-diagram',
    topic : 'select-trigger'
  }
};

/**
 * Events subscribed by this module
 */

export const SUB_EVENTS = {
  addTask : {
    channel : 'mock-flogo-flows-detail-diagram',
    topic : 'public-add-task'
  },
  selectTask : {
    channel : 'mock-flogo-flows-detail-diagram',
    topic : 'public-select-task'
  },
  addTrigger : {
    channel : 'mock-flogo-flows-detail-diagram',
    topic : 'public-add-trigger'
  },
  selectTrigger : {
    channel : 'mock-flogo-flows-detail-diagram',
    topic : 'public-select-trigger'
  }
};
