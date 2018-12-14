import { FlogoError } from './flogo-error';
import { ErrorCodes } from './error-codes';

export class ValidationError extends FlogoError {
  public details: { errors: object };
  constructor(message, errors: object, constructorOpt?: Function) {
    super(message, {
      type: ErrorCodes.Common.Validation,
      details: { errors },
      ctr: constructorOpt || ValidationError,
    });
  }
}
