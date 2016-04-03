/**
 * Events published from this module
 */

export const PUB_EVENTS = {
  runFromThisTitle : {
    channel : 'flogo-task-container',
    topic : 'run-from-this-tile'
  }
};

/**
 * Events subscribed by this module
 */
export const SUB_EVENTS = {
  updateTaskResults : {
    channel : 'flogo-task-container',
    topic : 'update-task-results'
  }
};
