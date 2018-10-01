import isArray from 'lodash/isArray';

import { ERROR_TYPES } from '../../common/errors/error-types';
import { logger } from '../../common/logging';

export async function v1ErrorMiddleware(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (err.isOperational && err.type == ERROR_TYPES.COMMON.REST_API) {
      ctx.status = err.details.status;

      ctx.body = {
        errors: isArray(err.details.meta) ? err.details.meta.map(errMeta => errMeta.details) : [err.details]
      };

    } else if (err.status == 400 && err.details) {
      // Set our response.
      ctx.status = err.status;
      ctx.body = err.details;
    } else {
      // rethrow
      ctx.throw(err);
    }
  }
}

export async function v2ErrorMiddleware(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (err.isOperational && err.type === ERROR_TYPES.COMMON.REST_API) {
      ctx.status = err.details.status;
      let errors = err.details && err.details.errors;
      if (!errors) {
        errors = isArray(err.details) ? err.details : [err.details];
      }
      ctx.body = {
        errors,
      };
    } else if (err.status == 400 && err.details) {
      ctx.status = err.status;
      ctx.body = err.details;
    } else {
      if (err.isOperational) {
        logger.info(err);
      } else {
        logger.error(err);
      }
      ctx.status = 500;
      ctx.body = {
        status: 500,
        message: 'Internal error',
      };
    }
  }
}

