import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { HttpUtilsService } from './http-utils.service';
import { Link } from '../../models/engine.models';
import { FlowInfo, Interceptor, InterceptorTask, Snapshot, Step } from '../../models/runner.models'

/**
 * Possible run status
 */
export class RUN_STATUS_CODE {
  static NOT_STARTED: '0' = '0';
  static ACTIVE: '100' = '100';
  static COMPLETED: '500' = '500';
  static CANCELLED: '600' = '600';
  static FAILED: '700' = '700';
}

export interface StatusResponse {
  id: string,
  /**
   * A value from RUN_STATUS_CODE or null
   * @see RUN_STATUS_CODE
   */
  status: string|null
}

export interface StepsResponse {
  steps: Step[];
}

export interface StoredProcessResponse {
  creationDate: string;
  description: string;
  id: string;
  name: string;
}

export interface RestartResponse {
  id: string;
}

@Injectable()
export class RunService {
  constructor(private http: Http, private httpUtils: HttpUtilsService) {
  }

  getStatusByInstanceId(id: string): Observable<StatusResponse|null> {
    return this.fetch(`flows/run/instances/${id}/status`);
  }

  getStepsByInstanceId(id: string): Observable<StepsResponse> {
    return this.fetch(`flows/run/instances/${id}/steps`);
  }

  //todo: response interface
  getInstance(instanceId: string) {
    return this.fetch(`flows/run/instances/${instanceId}`);
  }

  getSnapshot(instanceId: string, snapshotId: number): Observable<Snapshot> {
    return this.fetch(`flows/run/instances/${instanceId}/snapshot/${snapshotId}`);
  }

  // todo: data interface
  // todo: response interface
  startProcess(flowId: string, data: any): Observable<any> {
    return this.post('flows/run/flow/start', { flowId, attrs: data });
  }

  storeProcess(flowInfo: FlowInfo): Observable<StoredProcessResponse> {
    //  upload current flow to process service server
    return this.post<StoredProcessResponse>('flows/run/flows', flowInfo)
      .map(storedProcess => {
        // TODO
        //  need to handle the empty response
        //  maybe later on the /flows API should be changed to reply the exist process
        //  instead of an empty response, however, in that case this block won't be run
        return storedProcess;
      });
  }

  // TODO: original name was restartWithIcptFrom, what is "icpt?
  // TODO
  //  to do proper restart process, need to select proper snapshot, hence
  //  the current implementation is only for the last start-from-beginning snapshot, i.e.
  //  the using this.runState.processInstanceId to restart
  restartFrom(processInstanceId: string, step: number, interceptor: Interceptor, updateProcessId?: string ): Observable<RestartResponse> {
    // get the state of the last step
    let snapshotId = step - 1;
    if (snapshotId < 1) {
      return ErrorObservable.create(new Error(`Invalid step ${step} to start from.`));
    }

    return this.getSnapshot(processInstanceId, snapshotId)
      .map(snapshot =>
        updateProcessId ? updateSnapshotActionUri(snapshot, updateProcessId) : snapshot)
      .switchMap(() => {
        // TODO: flowinfo interface
        return this.fetch(`flows/run/flows/${updateProcessId}`)
          .map(flowInfo => _.get(flowInfo, 'rootTask.links', []));
      }, (snapshot, links) => ({ snapshot, links }))
      .switchMap(({ snapshot, links }) => {
        // process state info based on flowInfo
        // find all of the tasks in the path of the given tasks to intercept.
        // i.e. remove the tasks that won't get executed because they are not linked
        let taskIdsInPath = this.findTaskIdsInLinkPath(interceptor.tasks, links);
        // get rid of the tasks that don't need to be executed
        let filteredSnapshot = this.filterSnapshot(snapshot, taskIdsInPath);

        // then restart from that state with data
        // TODO: document response data
        return this.post('flows/run/restart', {
          initialState: filteredSnapshot,
          interceptor,
        });
      });

    function updateSnapshotActionUri(snapshot, newFlowId) {
      // replace the old flowURL with the newFlowID
      let pattern = new RegExp('flows\/(.+)$');
      snapshot.actionUri = snapshot.flowUri.replace(pattern, `flows/${newFlowId}`);
      /** @deprecated snapshot.flowUri */
      snapshot.flowUri = snapshot.actionUri;
      return snapshot;
    }

  }

  private fetch<T>(path: string): Observable<T> {
    return this.http.get(this.httpUtils.apiPrefix(path, 'v1'), this.httpUtils.defaultOptions())
      .map(response => response.json());
  }

  private post<T>(path: string, body: any): Observable<T>{
    return this.http.post(
      this.httpUtils.apiPrefix(path, 'v1'),
      body,
      this.httpUtils.defaultOptions().merge({
        headers: new Headers({ 'Accept': 'application/json' })
      })
    ).map(response => response.json());
  }

  /**
   * Remove from the snapshot the info of the tasks that are NOT in the taskIds
   * @param snapshot
   * @param taskIds
   * @return {any}
   */
  private filterSnapshot(snapshot: Snapshot, taskIds: string[]) {

    let workQueue = snapshot.workQueue || [];
    snapshot.rootTaskEnv = snapshot.rootTaskEnv || {};
    let taskData = snapshot.rootTaskEnv.taskDatas || [];

    // filter out the tasks that are not in the path
    workQueue = _.filter(workQueue, (queueItem: any) => {
      return taskIds.indexOf(queueItem.taskID) !== -1;
    });

    // filter out the tasks that are not in the path
    taskData = _.filter(taskData, (taskDatum: any) => {
      return taskDatum.taskId === 1 || taskIds.indexOf(taskDatum.taskId) !== -1;
    });

    snapshot.workQueue = workQueue;
    // "taskDatas" in plural is not a typo, that's how the API expects it
    snapshot.rootTaskEnv.taskDatas = taskData;

    return snapshot;
  }

  // TODO: left algorithm as it was when refactored, need to make it clearer
  private findTaskIdsInLinkPath(tasks: InterceptorTask[], links: Link[]) {
    // TODO: icpt, what does it mean?? for icpTaskIds
    let tasksIdsInPath: string[] = _.map(tasks, (task: any) => task.id);
    let linksToGo = links.slice();
    let lastLinksToGoLength = linksToGo.length;

    let filterLinksAndAccumulateTasks = (link: any) => {
      if (tasksIdsInPath.indexOf(link.from) !== -1) {
        // avoid duplications
        if (tasksIdsInPath.indexOf(link.to) === -1) {
          tasksIdsInPath.push(link.to);
        }
        return false;
      }
      return true;
    };

    // once the linksToGo stay the same or empty, then finish
    while (linksToGo.length) {
      linksToGo = _.filter(linksToGo, filterLinksAndAccumulateTasks);
      if (lastLinksToGoLength === linksToGo.length) {
        break;
      }
      lastLinksToGoLength = linksToGo.length;
    }
    return tasksIdsInPath;
  }

}
