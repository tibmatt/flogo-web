/**
 * Events published from this module
 */

export const PUB_EVENTS = {
  addTrigger : {
    channel : 'flogo-flows-detail-triggers',
    topic : 'add-trigger'
  },
  selectTrigger : {
    channel : 'flogo-flows-detail-triggers',
    topic : 'select-trigger'
  }
};

/**
 * Events subscribed by this module
 */
export const SUB_EVENTS = {
  addTrigger : {
    channel : 'flogo-flows-detail-triggers',
    topic : 'public-add-trigger'
  },
  selectTrigger : {
    channel : 'flogo-flows-detail-triggers',
    topic : 'public-select-trigger'
  }
};
