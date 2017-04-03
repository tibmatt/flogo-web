/**
 * Events published from this module
 */

export const PUB_EVENTS = {
  selectTask : {
    channel : 'flogo-flows-detail-tasks',
    topic : 'select-task'
  },
  triggerAction : {
    channel : 'flogo-flows-detail-tasks',
    topic : 'trigger-action'
  }
};

/**
 * Events subscribed by this module
 */
export const SUB_EVENTS = {
  selectTask : {
    channel : 'flogo-flows-detail-tasks',
    topic : 'public-select-task'
  }
};
