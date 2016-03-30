/**
 * Events published from this module
 */

export const PUB_EVENTS = {
  addTask : {
    channel : 'flogo-flows-detail-graphic',
    topic : 'add-task'
  },
  selectTask : {
    channel : 'flogo-flows-detail-graphic',
    topic : 'select-task'
  },
  addTrigger : {
    channel : 'flogo-flows-detail-graphic',
    topic : 'add-trigger'
  },
  selectTrigger : {
    channel : 'flogo-flows-detail-graphic',
    topic : 'select-trigger'
  }
};

/**
 * Events subscribed by this module
 */
export const SUB_EVENTS = {
};
