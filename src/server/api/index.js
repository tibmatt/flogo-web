import {activities} from './activities';
import {triggers} from './triggers';
import {flows} from './flows';
import {errorHandler} from './error';
import {flowsDetail} from './flows.detail';
import {engine} from './engine';

export function api(app, router) {
  errorHandler(app, router);
  activities(app, router);
  triggers(app, router);
  flows(app, router);
  flowsDetail(app, router);
  engine(app, router);
}