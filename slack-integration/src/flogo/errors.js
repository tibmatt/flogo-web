'use strict';

const CLIENT_ERRORS = {
  NOT_FOUND: 'not-found',
  NO_FLOW: 'no-flow',
  FLOW_NOT_FOUND: 'flow-not-found',
  ALREADY_EXISTS: 'already-exists',
  MISSING_TRIGGER: 'missing-trigger'
};

const SERVER_ERRORS = {
  TRIGGER_NOT_FOUND: 'TRIGGER_NOT_FOUND',
  ACTIVITY_NOT_FOUND: 'ACTIVITY_NOT_FOUND',
  FLOW_NOT_FOUND: 'FLOW_NOT_FOUND',
  MISSING_TRIGGER: 'MISSING_TRIGGER'
};

module.exports = {SERVER_ERRORS, CLIENT_ERRORS};
