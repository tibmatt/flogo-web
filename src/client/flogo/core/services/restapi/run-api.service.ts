import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable ,  throwError as _throw } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { flowToJSON_Link, Interceptor, InterceptorTask, Snapshot, Step, LegacyFlowWrapper } from '@flogo/core/interfaces';

import { HttpUtilsService } from './http-utils.service';
import { DEFAULT_REST_HEADERS } from './rest-api-http-headers';

/**
 * Possible run status
 */
export enum RunStatusCode {
  NotStarted = '0',
  Active = '100',
  Completed = '500',
  Cancelled = '600',
  Failed = '700',
}

/**
 * Possible run state
 */
export enum RunStateCode {
  Skipped = 50,
}

export interface StatusResponse {
  id: string;
  /**
   * A value from RunStatusCode or null
   * @see RunStatusCode
   */
  status: string | null;
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
export class RunApiService {
  constructor(
    private http: HttpClient,
    private httpUtils: HttpUtilsService,
    @Inject(DEFAULT_REST_HEADERS) private defaultHeaders: HttpHeaders) {
  }

  getStatusByInstanceId(id: string): Observable<StatusResponse | null> {
    return this.fetch(`flows/run/instances/${id}/status`);
  }

  getStepsByInstanceId(id: string): Observable<StepsResponse> {
    return this.fetch(`flows/run/instances/${id}/steps`);
  }

  // todo: response interface
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

  storeProcess(flowInfo: LegacyFlowWrapper): Observable<StoredProcessResponse> {
    //  upload current flow to process service server
    return this.post<StoredProcessResponse>('flows/run/flows', flowInfo).pipe(
      map(storedProcess => {
        // TODO
        //  need to handle the empty response
        //  maybe later on the /flows API should be changed to reply the exist process
        //  instead of an empty response, however, in that case this block won't be run
        return storedProcess;
      })
    );
  }

  // TODO: original name was restartWithIcptFrom, what is "icpt?
  // TODO
  //  to do proper restart process, need to select proper snapshot, hence
  //  the current implementation is only for the last start-from-beginning snapshot, i.e.
  //  the using this.runState.processInstanceId to restart
  restartFrom(processInstanceId: string, step: number, interceptor: Interceptor, updateProcessId?: string): Observable<RestartResponse> {
    // get the state of the last step
    const snapshotId = step - 1;
    if (snapshotId < 0) {
      return _throw(new Error(`Invalid step ${step} to start from.`));
    }

    return this.getSnapshot(processInstanceId, snapshotId)
      .pipe(
        map(snapshot => updateProcessId ? updateSnapshotActionUri(snapshot, updateProcessId) : snapshot),
        switchMap((snapshot) => {
          // TODO: flowinfo interface
          return this.fetch(`flows/run/flows/${updateProcessId}`)
            .pipe(
              map(flowInfo => {
                const links = _.get(flowInfo, 'rootTask.links', []);
                return { snapshot, links };
              })
            );
        }),
        switchMap(({snapshot, links}) => {
          // process state info based on flowInfo
          // find all of the tasks in the path of the given tasks to intercept.
          // i.e. remove the tasks that won't get executed because they are not linked
          const taskIdsInPath = this.findTaskIdsInLinkPath(interceptor.tasks, links);
          // get rid of the tasks that don't need to be executed
          const filteredSnapshot = this.filterSnapshot(snapshot, taskIdsInPath);

          // then restart from that state with data
          // TODO: document response data
          return this.post('flows/run/restart', {
            initialState: filteredSnapshot,
            interceptor,
          });
        }),
      );

    function updateSnapshotActionUri(snapshot, newFlowId) {
      // replace the old flowURL with the newFlowID
      const pattern = new RegExp('flows\/(.+)$');
      snapshot.actionUri = snapshot.flowUri.replace(pattern, `flows/${newFlowId}`);
      /** @deprecated snapshot.flowUri */
      snapshot.flowUri = snapshot.actionUri;
      return snapshot;
    }

  }

  private fetch<T>(path: string): Observable<T> {
    return this.http.get<T>(this.httpUtils.apiPrefix(path, 'v1'), { headers: this.defaultHeaders });
  }

  private post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(
      this.httpUtils.apiPrefix(path, 'v1'),
      body,
      { headers: this.defaultHeaders },
    );
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
      return taskDatum.taskId === '1' || taskDatum.taskId === 1 || taskIds.indexOf(taskDatum.taskId) !== -1;
    });

    snapshot.workQueue = workQueue;
    // "taskDatas" in plural is not a typo, that's how the API expects it
    snapshot.rootTaskEnv.taskDatas = taskData;

    return snapshot;
  }

  // TODO: left algorithm as it was when refactored, need to make it clearer
  private findTaskIdsInLinkPath(tasks: InterceptorTask[], links: flowToJSON_Link[]) {
    // TODO: icpt, what does it mean?? for icpTaskIds
    const tasksIdsInPath: string[] = _.map(tasks, (task: any) => task.id);
    let linksToGo = links.slice();
    let lastLinksToGoLength = linksToGo.length;

    const filterLinksAndAccumulateTasks = (link: any) => {
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
