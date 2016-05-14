import {config} from '../../config/app-config';
let basePath = config.app.basePath;

export function errorHandler(app, router) {

  router.use(basePath, function *(next) {
    try {
      yield next;
    } catch (err) {
      if(err.status == 400 && err.details) {
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
