import {activities} from './activities';
import {triggers} from './triggers';
import {flows} from './flows';
import {errorHandler} from './error';
import {flowsDetail} from './flows.detail';
import {engine} from './engine';
import {ping} from './ping';
import {configuration} from './configuration';
import {flowsRun} from './flows.run';
import {samples} from './samples';
import {logs} from './logs';

export function api(app, router) {
  errorHandler(app, router);
  activities(app, router);
  triggers(app, router);
  flows(app, router);
  flowsDetail(app, router);
  engine(app, router);
  ping(app, router);
  flowsRun(app, router);
  samples(app, router);
  logs(app, router);
  configuration(app, router);
}
