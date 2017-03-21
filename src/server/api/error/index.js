import isArray from 'lodash/isArray';

import { config } from '../../config/app-config';
import { ERROR_TYPES } from '../../common/errors/error-types';
import { logger } from '../../common/logging';

let basePath = config.app.basePath;
const basePathV2 = config.app.basePathV2;

export function errorHandler(app, router) {

  router.use(basePath, function *(next) {
    try {
      yield next;
    } catch (err) {
      if (err.isOperational && err.type == ERROR_TYPES.COMMON.REST_API) {
        this.status = err.details.status;

        this.body = {
          errors: isArray(err.details.meta) ? err.details.meta.map(errMeta => errMeta.details) : [err.details]
        };

      } else if (err.status == 400 && err.details) {
        // Set our response.
        this.status = err.status;
        this.body = err.details;
      } else {
        // rethrow
        this.throw(err);
      }
    }
  });

  router.use(basePathV2, function* (next) {
    try {
      yield next;
    } catch (err) {
      if (err.isOperational && err.type === ERROR_TYPES.COMMON.REST_API) {
        this.status = err.details.status;
        let errors = err.details && err.details.errors;
        if (!errors) {
          errors = isArray(err.details) ? err.details : [err.details];
        }
        this.body = {
          errors,
        };
      } else if (err.status == 400 && err.details) {
        // Set our response.
        this.status = err.status;
        this.body = err.details;
      } else {
        if (err.isOperational) {
          logger.info(err);
        } else {
          logger.error(err);
        }
        this.status = 500;
        this.body = {
          status: 500,
          message: 'Internal error',
        };
      }
    }
  });
}
