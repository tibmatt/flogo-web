import { FlogoError } from './flogo-error';
import { ERROR_TYPES } from './error-types';

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
    return new FlogoError(message, { ctr: ErrorManager.makeError, ...options });
  }

  /**
   *
   * @param message
   * @param details
   * @param ctr
   */
  static createValidationError(message, details, ctr) {
    return ErrorManager.makeError(message, {
      type: ERROR_TYPES.COMMON.VALIDATION,
      details: {
        errors: details,
      },
      ctr: ctr || ErrorManager.createValidationError,
    });
  }

  /**
   * Creates a custom validation error object which caused due to the data the server logic is performing on.
   * The method has message, keyword and details as parameters.
   *
   * @param {string} message - message to be sent to the client
   * @param {string} keyword
   * @param {object} [details] - optional details
   * @param {string} [details.dataPath] - path of the data at which the validation has failed
   * @param {object [details.params] -  an object which can have custom error specific extra information based on which
   * the error occurred
   */
  static createCustomValidationError(message, keyword, { dataPath, params } = {}) {
    if (!keyword) {
      throw new Error('Missing required keyword parameter');
    }
    const error = {
      keyword,
      message,
      schemaPath: '#/custom',
      dataPath: dataPath || '',
      params: params || {},
    };

    return ErrorManager.createValidationError('Validation error', {
      details: [error],
    });
  }

  /**
   * Create a sanitized error marked as ready to propagate from the API to the user
   * @param message {string} message
   * @param details {any} Error details
   * @param details.status {int} The HTTP status code applicable to this problem. Defaults to 400
   * @param details.code {string} An application-specific error code, expressed as a string value.
   * @param details.title {string} A short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem
   * @param details.detail {string} (optional) A human-readable explanation specific to this occurrence of the problem.
   * @param details.meta {object} (optional) A meta object containing non-standard meta-information about the error. Ex. for validation the property details
   * @param [ctr]
   */
  static createRestError(message = 'REST Api Error', details, ctr) {
    details.status = details.status || 400;
    return ErrorManager.makeError(message, {
      type: ERROR_TYPES.COMMON.REST_API,
      details,
      ctr: ctr || ErrorManager.createRestError,
    });
  }

  /**
   * Create a sanitized error marked as ready to propagate from the API to the user
   * @param message {string} message
   * @param [details] {any} Error details
   * @param details.title {string} (optional) A short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem
   * @param details.detail {string} (optional) A human-readable explanation specific to this occurrence of the problem.
   * @param details.meta {object} (optional) A meta object containing non-standard meta-information about the error. Ex. for validation the property details
   */
  static createRestNotFoundError(message = 'Resource not found', details) {
    details = Object.assign(
      {
        status: 404,
        code: ERROR_TYPES.COMMON.NOT_FOUND,
        title: 'Resource not found',
      },
      details
    );
    return ErrorManager.createRestError(
      message,
      details,
      ErrorManager.createRestNotFoundError
    );
  }

  static validationToRestErrors(validationErrors = []) {
    return validationErrors.map(validationError =>
      ErrorManager.createRestError(
        validationError.title,
        {
          status: 400,
          code: validationError.type,
          title: validationError.title,
          detail: validationError.detail,
          meta: {
            property: validationError.property,
            value: validationError.value,
          },
        },
        ErrorManager.validationToRestErrors
      )
    );
  }
}
