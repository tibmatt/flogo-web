/**
 * Events published from this module
 */

export const PUB_EVENTS = {
  runFromThisTile : {
    channel : 'flogo-task',
    topic : 'run-from-this-tile'
  }
};

/**
 * Events subscribed by this module
 */
export const SUB_EVENTS = {
  updateTaskResults: {
    channel: 'flogo-task',
    topic: 'update-task-results'
  }
};
