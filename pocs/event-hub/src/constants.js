export const TEST = true; // is test mode;
export const INFO = TEST && true; // is info mode;
export const DEBUG = TEST && true; // is debug mode;
export const VERBOSE = DEBUG && true; // is verbose mode;

export const ERRORS = {
  '404': {
    code: 404,
    errMsg: 'Not Found'
  },
  // construction error
  '700': {
    code: 700,
    errMsg: 'Invalid Parameters'
  }
}

export const EVENT_SERVICE_CONFIG = {
  AFFIX: {
    DONE: '-done',
    PROC: '-in-process',
    ERR: '-error'
  }
}
