import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { ScalarObservable } from 'rxjs/observable/ScalarObservable';

import 'rxjs/add/observable/throw';

import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/exhaustMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/last';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/race';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeWhile';

import {
  RUN_STATE_CODE,
  RUN_STATUS_CODE,
  RunService,
  StatusResponse
} from '@flogo/core/services/restapi/run.service';
import { flogoFlowToJSON } from '../shared/diagram/models/flow.model';
import { Interceptor, Step, flowToJSON_InputFlow } from '@flogo/core/interfaces';
import { ErrorService } from '@flogo/core/services/error.service';

export const ERRORS = {
  MAX_TRIALS_REACHED: 'MaxTrialsReached',
  PROCESS_NOT_COMPLETED: 'ProcessNotCompleted'
};

export { RUN_STATUS_CODE, RUN_STATE_CODE, Step };

export interface RunStatus extends StatusResponse {
  /**
   * Trial index. Starts at 1.
   */
  trial: number;
}

interface BaseRunOptions {
  maxTrials?: number;
  queryInterval?: number;
  useProcessId?: string;
  useFlow?: flowToJSON_InputFlow;
}

export interface RunOptions extends BaseRunOptions {
  // todo: interface
  attrsData: Array<{ name: string; type: string; value: any }> | null;
}

export interface RerunOptions extends BaseRunOptions {
  instanceId: string;
  step: number;
  interceptor: Interceptor;
}

export interface RunProgressStore {
  /**
   * Observer when process has been registered to start
   */
  registered: Observable<{ processId: string, instanceId: string }>;
  /**
   * The state of the runner
   */
  state: Observable<RunProgress>;
  /**
   * Stream of process status changes, will emit for every trial
   */
  processStatus: Observable<RunStatus>;
  /**
   * Stream of steps, will emit only when steps change (starts with null)
   */
  steps: Observable<Step[]>;
  /**
   * Will emit the runner state once the run has completed successfully
   */
  completed: Observable<RunProgress>;
}

export interface RunProgress {
  processId: string;
  instanceId: string;
  runStatus: RunStatus;
  steps: Step[];
  // todo interface
  lastInstance: any;
}

type StartFlowFn = (processId: string) => Observable<{ id: string }>;

/**
 * Main point of interaction with services to run a flow.
 *
 * Usually only {@link RunnerService#runFromRoot} and {@link RunnerService#rerun} are required.
 *
 */
@Injectable()
export class RunnerService {

  constructor(private runService: RunService, private errorService: ErrorService) {
  }

  /**
   * Run a flow from the root task.
   *
   * @example
   * const runner = runnerService.runFromRoot({
   *   useFlow: { _id: "flows:flogoweb-admin:2017-02-24T18:21:29.014Z", items: { ... }, paths: {...}  },
   *   attrsData: [{"name":"params", "type":"params", "value":{ "id":3 }}]
   * });
   *
   * runner.state.subscribe(...);
   * runner.completed.subscribe(...);
   *
   * @example
   * const runner = runnerService.runFromRoot({
   *   useProcessId: "a435bcertyu",
   *   attrsData: [{"name":"params", "type":"params", "value":{ "id":3 }}],
   * });
   *
   * runner.state.subscribe(...);
   * runner.completed.subscribe(...);
   *
   * @param {object} opts - Options
   * @param {object} opts.attrsData - Input data to be used to run the flow
   * @param {string} [opts.useProcessId] - If provided will use an existing registered flow. Incompatible with useFlow option.
   * @param {object} [opts.useFlow] - Flow to run (this is the internal flogo web flow model, not the engine flow)
   * @param {number} [opts.maxTrials=20] - Max number of trials to get a status that indicates completion of the process
   * @param {number} [opts.queryInterval=500] - Polling interval to query for status (In milliseconds)
   * @return {RunProgressStore}
   * @see RunProgressStore
   * @see RunnerService#monitorProcessStatus
   */
  runFromRoot(opts: RunOptions): RunProgressStore {
    return this.startAndMonitor(opts, processId => this.runService.startProcess(processId, opts.attrsData));
  }

  /**
   * Rerun an existing flow from a particular step.
   *
   * @example
   * const runner = runnerService.runFromRoot({
   *   instanceId: "3aa6b7384aa876bda541662bbcc43cfa"}
   *   step: 2,
   *   useFlow: { _id: "flows:flogoweb-admin:2017-02-24T18:21:29.014Z", items: { ... }, paths: {...}  },
   *   interceptor: {
   *      "tasks":[
   *         { "id":2, "inputs": [{ "name":"counterName","type":"string","required":true,"value":"number"}, ...] }
   *       ]
   *   }
   * });
   *
   * runner.state.subscribe(...);
   * runner.completed.subscribe(...);
   *
   * @example
   * const runner = runnerService.runFromRoot({
   *   useProcessId: "a435bcertyu",
   *   attrsData: [{"name":"params", "type":"params", "value":{ "id":3 }}],
   * })
   *
   *
   * @param {object} opts - Options
   * @param {string} opts.instanceId - id of the instance that will be re-run
   * @param {number} opts.step - step to start from
   * @param {object} opts.interceptor - interceptor data
   * @param {object} opts.useFlow - Flow to run (this is the internal flogo web flow model, not the engine flow)
   * @param {number} [opts.maxTrials=20] - Max number of trials to get a status that indicates completion of the process
   * @param {number} [opts.queryInterval=500] - Polling interval to query for status (In milliseconds)
   * @return {RunProgressStore}
   * @see RunProgressStore
   * @see RunnerService#monitorProcessStatus
   */
  rerun(opts: RerunOptions): RunProgressStore {
    const { instanceId, step, interceptor } = opts;
    return this.startAndMonitor(opts, newProcessId => {
      return this.runService.restartFrom(instanceId, step, interceptor, newProcessId);
    });
  }

  startAndMonitor(opts: BaseRunOptions, startFlow: StartFlowFn): RunProgressStore {

    const registered = this.registerAndStartFlow(opts, startFlow).share();

    const instanceStatus = registered
      .switchMap(info => this.monitorProcessStatus(info.instanceId, opts))
      .share();

    // start with null to force the stream to start emitting
    const querySteps = this.queryForSteps(instanceStatus).startWith(null);

    // merge all into a single state
    const state: Observable<RunProgress> = this.mergeState(instanceStatus, querySteps, registered).share();

    const steps = this.streamSteps(registered, state).share();

    const completed = this.observeCompletion(state).share();

    return {
      registered,
      state,
      processStatus: instanceStatus.distinctUntilChanged((prev, next) => _.isEqual(prev, next)),
      steps,
      completed,
    };

  }


  /**
   * Monitoring the status of a running process.
   *
   * Observable will emit while:
   * - Process has not started (code 0).
   * - Process is running (code 100)
   * - Process is completed (code 500). Will emit this event only once and stream will be completed.
   * - Unknown code is received (ex. null)
   *
   * Observable will error when:
   *  - Cancelled process status is encountered (code 600).
   *  - Failed process status is encountered (code 700).
   *  - Max number of trials is reached.
   *
   *  Refer to {@link RUN_STATUS_CODE} for the status codes.
   *
   *  @example
   *    runner.monitorProcessStatus("123").subscribe(
   *      state => {
   *        // while process is still running and also when it is completed
   *        status.status; // code that indicates current status. Ex. not started (0), running (100) or completed (500)
   *        status.trial; // will increment after every emit
   *      },
   *      error => {
   *         error.status; // When error was caused because process was not completed (ProcessNotCompleted).
   *      },
   *      completed => {
   *        // after complete status (code 500)
   *      }
   *    );
   *
   * @see RUN_STATUS_CODE
   * @see RunStatus
   * @param processInstanceID {string} - The id of a running process
   * @param {object} [opts] - Options
   * @param {number} [opts.maxTrials=20] - Max number of trials to get a status that indicates completion of the process
   * @param {number} [opts.queryInterval=500] - Polling interval to query for status (In milliseconds)
   * @return {Observable<RunStatus>} Observable of the running status. Stream will be completed after code indicating the
   * process run has finished.
   * @throws Error in observable with name {@link ERRORS | "ProcessNotCompleted"} when the process did not complete successfully.
   * Error property 'status' will contain the process status.
   * @throws Error in observable with name {@link ERRORS | "MaxTrialsReached"} when the process did not complete successfully.
   * @throws Synchronous error when processInstanceID parameter is not provided
   */
  monitorProcessStatus(processInstanceID: string, opts?: { maxTrials?: number, queryInterval?: number }): Observable<RunStatus> {
    opts = _.defaults({}, opts, {
      maxTrials: 20,
      // change this small polling interval to slow down, this is for evaluating
      queryInterval: 500 // ms
    }, opts);

    if (!processInstanceID) {
      throw new Error('No process instance has been logged.');
    }

    const source: Observable<RunStatus> = TimerObservable.create(0, opts.queryInterval)
      .exhaustMap(i => {
        if (i < opts.maxTrials) {
          return this.runService.getStatusByInstanceId(processInstanceID);
        }
        // or fail when we exhaust the maximum number of attempts
        return Observable.throw(this.errorService.makeOperationalError(ERRORS.MAX_TRIALS_REACHED, 'Max trials reached'));
      })
      .map((response: StatusResponse | null, index: number) => {
        response = response || { id: null, status: null };
        if (response.status !== RUN_STATUS_CODE.CANCELLED && response.status !== RUN_STATUS_CODE.FAILED) {
          const runStatus = <RunStatus> Object.assign({}, response);
          runStatus.trial = index + 1;
          return runStatus;
        } else {
          throw this.errorService.makeOperationalError(
            ERRORS.PROCESS_NOT_COMPLETED,
            `Run error. Status: ${response.status}`, { status: response.status }
          );
        }
      })
      .share();

    const isStatusCompleted = (status: string) => status === RUN_STATUS_CODE.COMPLETED;

    return source
    // continue until we reach the completed status
      .takeWhile(runStatus => !isStatusCompleted(runStatus.status))
      // also publish the completion status
      .merge(source.filter(runStatus => isStatusCompleted(runStatus.status)).take(1));
  }

  registerAndStartFlow(opts: BaseRunOptions, startFlow: StartFlowFn): Observable<{ processId: string, instanceId: string }> {
    return this.registerFlowIfNeeded(opts)
      .switchMap(processId => startFlow(processId).map(result => result.id),
        (processId, instanceId) => ({ processId, instanceId: instanceId }));
  }

  registerFlowIfNeeded(opts: { useFlow?: flowToJSON_InputFlow, useProcessId?: string }) {
    let registered;
    if (opts.useFlow) {
      // generate process based on the current flow
      const process = flogoFlowToJSON(opts.useFlow);

      //  delete the id of the flow,
      //  since the same process ID returns 204 No Content response and cannot be updated,
      //  while the flow information without ID will be assigned an ID automatically.
      delete process.id;
      registered = this.runService.storeProcess(process)
        .map(storedProcess => storedProcess.id);
    } else if (opts.useProcessId) {
      registered = ScalarObservable.create(opts.useProcessId);
    } else {
      throw new Error('Provided info was not enough to run a flow');
    }
    return registered;
  }

  queryForSteps(processStatusMonitor: Observable<RunStatus>) {
    const shouldQuery = status => status === RUN_STATUS_CODE.ACTIVE || status === RUN_STATUS_CODE.COMPLETED;
    return processStatusMonitor
      .filter(runState => runState && shouldQuery(runState.status))
      .switchMap(runState => this.runService.getStepsByInstanceId(runState.id))
      .map(steps => steps.steps);
  }

  streamSteps(registered: Observable<{ instanceId: string }>, stateStream: Observable<RunProgress>) {
    return registered.exhaustMap(registerInfo => {
      return stateStream
        .catch(error => { // query steps one last time if process failed or was cancelled
          if (registerInfo.instanceId && error.name === ERRORS.PROCESS_NOT_COMPLETED) {
            return this.runService.getStepsByInstanceId(registerInfo.instanceId);
          }
          return Observable.throw(error);
        })
        .map(state => state.steps)
        .distinctUntilChanged((prev, next) => _.isEqual(prev, next));
    });
  }

  private mergeState(instanceStatusStream, queryStepsStream, processRegisteredStream): Observable<RunProgress> {
    return queryStepsStream
      .combineLatest(
        instanceStatusStream,
        processRegisteredStream,
        (steps, runStatus, registeredInfo) => ({
          instanceId: registeredInfo.instanceId,
          processId: registeredInfo.processId,
          runStatus,
          steps,
          lastInstance: null
        })
      );
  }

  private observeCompletion(stateStream: Observable<RunProgress>) {
    return stateStream
      .last()
      .switchMap(
        state => this.runService.getInstance(state.instanceId),
        (runState, instance) => {
          runState.lastInstance = instance;
          return runState;
        }
      );
  }

}
