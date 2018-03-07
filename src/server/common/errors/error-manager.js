import {FlogoError} from './flogo-error';
import {ERROR_TYPES} from './error-types';

export class ErrorManager {

  /**
   *
   * @param message {string}
   * @param options {object}
   * @param options.type {string} error type (see error constants)
   * @param options.details {object}
   * @return {FlogoError}
   */
  static makeError(message, options) {
    return new FlogoError(message, options);
  }


  /**
   *
   * @param message
   * @param details
   */
  static createValidationError(message, details) {
    return ErrorManager.makeError(message, {
      type: ERROR_TYPES.COMMON.VALIDATION,
      details: {
        errors: details
      }
    });
  }


  /**
   * Creates a custom validation error object which caused due to the data the server logic is performing on.
   * The method has message and details as parameters.
   *
   * 1. Message is type string and it is what send to the client.
   *
   * 2. Details param is an optional param. It can the following optional properties in it:
   *      dataPath: path of the data at which the validation has failed
   *      params: an object which can have custom error specific extra information based on which the error occurred
   *
   * @param message
   * @param details
   */
  static createCustomValidationError(message, {dataPath, params} = {}) {
    const errorDetails = {details: []};
    const error = {
      keyword: "custom",
      message: message,
      schemaPath: "#/custom"
    };
    error.dataPath = dataPath ? dataPath : "";
    error.params = params ? params : {};
    errorDetails.details.push(error);
    return ErrorManager.makeError("Custom validation error", {
      type: ERROR_TYPES.COMMON.VALIDATION,
      details: {
        errors: errorDetails
      }
    });
  }

  /**
   * Create a sanitized error marked as ready to propagate from the API to the user
   * @param message {string} message
   * @param details {object} Error details
   * @param details.status {int} The HTTP status code applicable to this problem. Defaults to 400
   * @param details.code {string} An application-specific error code, expressed as a string value.
   * @param details.title {string} A short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem
   * @param details.detail {string} (optional) A human-readable explanation specific to this occurrence of the problem.
   * @param details.meta {object} (optional) A meta object containing non-standard meta-information about the error. Ex. for validation the property details
   */
  static createRestError(message = 'REST Api Error', details) {
    details.status = details.status || 400;
    return ErrorManager.makeError(message, {
      type: ERROR_TYPES.COMMON.REST_API,
      details: details
    });
  }

  /**
   * Create a sanitized error marked as ready to propagate from the API to the user
   * @param message {string} message
   * @param details {object} Error details
   * @param details.title {string} (optional) A short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem
   * @param details.detail {string} (optional) A human-readable explanation specific to this occurrence of the problem.
   * @param details.meta {object} (optional) A meta object containing non-standard meta-information about the error. Ex. for validation the property details
   */
  static createRestNotFoundError(message = 'Resource not found', details) {
    details = Object.assign({}, { status: 404, code: ERROR_TYPES.COMMON.NOT_FOUND, title: 'Resource not found' }, details);
    return ErrorManager.createRestError(message, details);
  }

  static validationToRestErrors(validationErrors = []) {
    return validationErrors.map(validationError =>
      ErrorManager.createRestError(validationError.title, {
        status: 400,
        code: validationError.type,
        title: validationError.title,
        detail: validationError.detail,
        meta: {
          property: validationError.property,
          value: validationError.value
        }
      })
    );
  }

}
