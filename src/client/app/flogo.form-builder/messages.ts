/**
 * Events published from this module
 */

export const PUB_EVENTS = {
  runFromThisTile : {
    channel : 'flogo-task',
    topic : 'run-from-this-tile'
  },
  taskDetailsChanged: {
    chanel: 'flogo-task',
    topic: 'task-details-changed'
  },
  changeTileDetail: {
    channel : 'flogo-task',
    topic : 'change-tile-detail'
  },
  setTaskWarnings: {
    channel: 'flogo-task',
    topic: 'set-task-warnings'
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
