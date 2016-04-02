/**
 * Events published from this module
 */

export const PUB_EVENTS = {
  addTask : {
    channel : 'flogo-flows-detail-tasks',
    topic : 'add-task'
  }
};

/**
 * Events subscribed by this module
 */
export const SUB_EVENTS = {
  addTask : {
    channel : 'flogo-flows-detail-tasks',
    topic : 'public-add-task'
  },
  installActivity: {
    channel : 'flogo-flows-detail-tasks',
    topic : 'public-install-activity'
  }
};
