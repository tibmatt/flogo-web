/**
 * Events published from this module
 */

export const PUB_EVENTS = {
  openPanel : {
    channel : 'flogo-flows-detail-error-panel',
    topic : 'state-opened'
  },
  closePanel : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'state-closed'
  }
};

/**
 * Events subscribed by this module
 */

export const SUB_EVENTS = {
  openPanel : {
    channel : 'flogo-flows-detail-error-panel',
    topic : 'public-state-opened'
  },
  closePanel : {
    channel : 'flogo-flows-detail-diagram',
    topic : 'public-state-closed'
  }
};
