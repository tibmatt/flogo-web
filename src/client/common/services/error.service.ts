import { Injectable } from '@angular/core';
import { ERROR_CODE, ERROR_CONSTRAINT } from './../constants';

const ERROR_MAP = {
  [ERROR_CODE.UNIQUE]: ERROR_CONSTRAINT.NOT_UNIQUE,
  [ERROR_CODE.NOT_INSTALLED_ACTIVITY]: ERROR_CONSTRAINT.NOT_INSTALLED_ACTIVITY,
  [ERROR_CODE.NOT_INSTALLED_TRIGGER]: ERROR_CONSTRAINT.NOT_INSTALLED_TRIGGER,
  [ERROR_CODE.WRONG_INPUT_JSON_FILE]: ERROR_CONSTRAINT.WRONG_INPUT_JSON_FILE,
};

@Injectable()
export class ErrorService {

  public transformRestErrors(errors: {code: string, status: number|string}[]): {[key: string]: boolean} {
    let firstError = errors[0];
    if (firstError && (firstError.status === 500 || firstError.status === '500')) {
      // internal error
      return { unknown: true };
    }

    let transformed = {};
    errors.forEach(error => {
      const constraint = ERROR_MAP[error.code];
      if (constraint) {
        transformed[constraint] = true;
      }
    });

    return transformed;
  }
}
