/**
 * Events published from this module
 */

export const PUB_EVENTS = {
  selectActivity : {
    channel : 'flogo-transform',
    topic : 'select-task'
  },
  saveTransform : {
    channel : 'flogo-transform',
    topic : 'save-transform'
  },
  deleteTransform : {
    channel : 'flogo-transform',
    topic : 'delete-transform'
  }
};

/**
 * Events subscribed by this module
 */
export const SUB_EVENTS = {
  selectActivity : {
    channel : 'flogo-transform',
    topic : 'public-select-task'
  },
  saveTransform : {
    channel : 'flogo-transform',
    topic : 'public-save-transform'
  },
  deleteTransform : {
    channel : 'flogo-transform',
    topic : 'public-delete-transform'
  }
};
