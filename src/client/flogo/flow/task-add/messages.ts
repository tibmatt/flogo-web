/**
 * Events published from this module
 */

export const PUB_EVENTS = {
  addTask : {
    channel : 'flogo-flow-task-add',
    topic : 'add-task'
  }
};

/**
 * Events subscribed by this module
 */
export const SUB_EVENTS = {
  addTask : {
    channel : 'flogo-flow-task-add',
    topic : 'public-add-task'
  },
  installActivity: {
    channel : 'flogo-flow-task-add',
    topic : 'public-install-activity'
  }
};
