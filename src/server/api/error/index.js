import isArray from 'lodash/isArray';

import {config} from '../../config/app-config';
import {ERROR_TYPES} from '../../common/errors/error-types';

let basePath = config.app.basePath;

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

}
