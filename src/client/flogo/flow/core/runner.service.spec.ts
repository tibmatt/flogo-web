import { Observable } from 'rxjs/Observable';
import { ArrayObservable } from 'rxjs/observable/ArrayObservable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { ScalarObservable } from 'rxjs/observable/ScalarObservable';

import 'rxjs/add/observable/concat';
import 'rxjs/add/operator/finally';
import Spy = jasmine.Spy;

import { RunService, StatusResponse } from '../../core/services/restapi/run.service';
import { ERRORS, RUN_STATUS_CODE, RunnerService } from './runner.service';
import { ErrorService } from '../../core/services/error.service';
import { UiFlow } from '@flogo/core';
import * as flowUtils from '../shared/diagram/models/flow.model';

describe('Service: RunService', function (this: {
  DEFAULT_PROCESS_ID: string,
  errorService: ErrorService,
  runServiceMock: RunService,
  service: RunnerService
}) {

  beforeAll(() => {
    this.DEFAULT_PROCESS_ID = '123';
  });

  beforeEach(() => {
    this.runServiceMock = jasmine.createSpyObj<RunService>('runService', [
      'getStatusByInstanceId',
      'getStepsByInstanceId',
      'getInstance',
      'storeProcess'
    ]);
    this.errorService = new ErrorService();
    this.service = new RunnerService(this.runServiceMock, new ErrorService());
  });

  describe('::monitorProcessStatus', () => {
    it('Should throw an error when process id is not provided', () => {
      expect(this.service.monitorProcessStatus).toThrowError();
    });

    it('Should complete when flow execution is completed', (done) => {
      const expectedSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [RUN_STATUS_CODE.COMPLETED]);
      setUpResponseSequence(<Spy>this.runServiceMock.getStatusByInstanceId, expectedSequence);
      expectSequenceCompleted(this.service, this.runServiceMock, expectedSequence, done);
    });

    it('Should continue while flow is running', (done) => {
      const expectedSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID,
        [RUN_STATUS_CODE.ACTIVE, RUN_STATUS_CODE.ACTIVE, RUN_STATUS_CODE.ACTIVE, RUN_STATUS_CODE.COMPLETED]
      );
      setUpResponseSequence(<Spy>this.runServiceMock.getStatusByInstanceId, expectedSequence);
      expectSequenceCompleted(this.service, this.runServiceMock, expectedSequence, done);
    });

    it('Should continue when process has not started or when unknown status is received', (done) => {
      const expectedSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID,
        [RUN_STATUS_CODE.NOT_STARTED, RUN_STATUS_CODE.ACTIVE, 9999, 'unknown', RUN_STATUS_CODE.COMPLETED]
      );
      setUpResponseSequence(<Spy>this.runServiceMock.getStatusByInstanceId, expectedSequence);
      expectSequenceCompleted(this.service, this.runServiceMock, expectedSequence, done);
    });

    it('Should emit an error after max attempts reached', (done) => {
      const responseSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID,
        [RUN_STATUS_CODE.NOT_STARTED, RUN_STATUS_CODE.ACTIVE, RUN_STATUS_CODE.ACTIVE, RUN_STATUS_CODE.ACTIVE, RUN_STATUS_CODE.ACTIVE]
      );
      setUpResponseSequence(<Spy>this.runServiceMock.getStatusByInstanceId, responseSequence);

      expectSequenceWithError(this.service, responseSequence, (error) => {
        expect(error).toBeDefined('No error passed to callback');
        expect(error.name).toEqual(ERRORS.MAX_TRIALS_REACHED);
      }, done, 3);

    });

    it('Should emit an error when flow execution fails', (done) => {
      const responseSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [
        RUN_STATUS_CODE.NOT_STARTED, RUN_STATUS_CODE.ACTIVE, RUN_STATUS_CODE.FAILED]
      );
      setUpResponseSequence(<Spy>this.runServiceMock.getStatusByInstanceId, responseSequence);

      expectSequenceWithError(this.service, responseSequence, (error) => {
        expect(error).toBeDefined('No error passed to callback');
        expect(error.name).toEqual(ERRORS.PROCESS_NOT_COMPLETED);
        expect(error.status).toEqual(
          RUN_STATUS_CODE.FAILED,
          `Expected error.status to be ${RUN_STATUS_CODE.FAILED} but found ${error.status}`
        );
      }, done);

    });

    it('Should emit an error when flow execution is cancelled', (done) => {
      const responseSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID,
        [RUN_STATUS_CODE.NOT_STARTED, RUN_STATUS_CODE.ACTIVE, RUN_STATUS_CODE.CANCELLED]
      );
      setUpResponseSequence(<Spy>this.runServiceMock.getStatusByInstanceId, responseSequence);

      expectSequenceWithError(this.service, responseSequence, (error) => {
        expect(error).toBeDefined('No error passed to callback');
        expect(error.name).toEqual(ERRORS.PROCESS_NOT_COMPLETED);
        expect(error.status).toEqual(RUN_STATUS_CODE.CANCELLED);
      }, done);
    });


    function expectSequenceCompleted(service: RunnerService, runServiceMock: RunService, sequence: any[], done) {
      let count = 0;
      service.monitorProcessStatus('123', { queryInterval: 2, maxTrials: 10 })
        .subscribe(state => {
            expect(state.status).toEqual(
              sequence[count].status,
              `Trial ${count} expected status ${sequence[count].status} but found ${state.status}`);
            count++;
          },
          err => {
            console.error('Expect sequence caught error:', err.stack);
          },
          () => {
            const queryCount = (<jasmine.Spy>runServiceMock.getStatusByInstanceId).calls.count();
            expect(queryCount <= sequence.length).toBeTruthy();
            expect(count).toEqual(sequence.length);
            done();
          }
        );
    }

    function expectSequenceWithError(
      service: RunnerService,
      sequence: any[],
      onError: (error) => void,
      done: () => void,
      maxAttempts?: number
    ) {
      let count = 0;

      const subscriber = {
        onError
      };
      spyOn(subscriber, 'onError').and.callThrough();

      service.monitorProcessStatus('123', { queryInterval: 1, maxTrials: maxAttempts })
        .finally(() => {
          expect(subscriber.onError).toHaveBeenCalled();
          if (maxAttempts) {
            expect(count).toEqual(maxAttempts);
          }
          done();
        })
        .subscribe(state => {
            expect(state.status).toEqual(
              sequence[count].status,
              `Trial ${count} expected status ${sequence[count].status} but found ${state.status}`
            );
            count++;
          },
          error => subscriber.onError(error)
        );
    }

  });
  // monitor process status />

  describe('::registerFlowIfNeeded', () => {

    it('When useProcessId option is provided it should just return that processId', done => {
      this.service.registerFlowIfNeeded({ useProcessId: 'custom-flow' })
        .subscribe(result => {
          expect(result).toEqual('custom-flow');
          done();
        });
    });

    it('When useFlow option is provided it should register the flow and return its id', done => {
      spyOn(flowUtils, 'flogoFlowToJSON').and.returnValue({ id: 'transformed-flow' });
      const storeProcessMock = <jasmine.Spy> this.runServiceMock.storeProcess;
      storeProcessMock.and.returnValue(ScalarObservable.create({ id: '456' }));

      const testFlow = <any> { name: 'test-flow' };
      this.service.registerFlowIfNeeded({ useFlow: <UiFlow>testFlow })
        .subscribe(result => {
          expect(flowUtils.flogoFlowToJSON).toHaveBeenCalledTimes(1);
          expect(storeProcessMock).toHaveBeenCalledTimes(1);
          expect(result).toEqual('456');
          done();
        });

    });

  });

  describe('::streamSteps', () => {

    const setup = (stateSeqPieces: any[], errorStream) => {
      const state = {
        processId: '123',
        instanceId: '456',
        runStatus: { id: 1, status: RUN_STATUS_CODE.ACTIVE },
        steps: [],
        lastInstance: null,
      };
      const stateSeq = stateSeqPieces.map(toMerge => Object.assign({}, state, toMerge));
      const stateStream = Observable.concat(
        ArrayObservable.create(stateSeq),
        errorStream,
      );

      const registeredStream = ScalarObservable.create({ processId: '123', instanceId: '456' });

      return {
        stateSeq,
        registeredStream,
        stateStream,
      };

    };

    it('Should fetch steps one time more after process failed', (done) => {

      const setupData = setup([{ steps: [1] }, { steps: [1, 2] }],
        ErrorObservable.create(this.errorService.makeOperationalError(ERRORS.PROCESS_NOT_COMPLETED, 'Run failed')));
      const { stateSeq, registeredStream, stateStream } = setupData;

      const mockStepsByInstance = <jasmine.Spy> this.runServiceMock.getStepsByInstanceId;
      mockStepsByInstance.and.returnValue(ScalarObservable.create({ steps: [1, 2, 3] }));

      const receivedSteps = [];
      const expectedSteps = stateSeq.map(s => s.steps).concat([[1, 2, 3]]);

      const subscriber = {
        onError() {
        }
      };
      spyOn(subscriber, 'onError');

      this.service.streamSteps(registeredStream, stateStream)
        .finally(() => {
          expect(receivedSteps).toEqual(expectedSteps);
          expect(mockStepsByInstance).toHaveBeenCalledTimes(1);
          expect(mockStepsByInstance.calls.mostRecent().args).toEqual(['456']);
          done();
        })
        .subscribe(steps => {
          receivedSteps.push(steps);
        }, subscriber.onError);

    });

    it('Should stop after process failed for an unknown reason', (done) => {
      const setupData = setup([{ steps: [1] }, { steps: [1, 2] }],
        ErrorObservable.create(new Error('unknown error')));
      const { stateSeq, registeredStream, stateStream } = setupData;

      const receivedSteps = [];
      const expectedSteps = stateSeq.map(s => s.steps);

      const subscriber = jasmine.createSpyObj('subscriber', ['onError']);

      this.service.streamSteps(registeredStream, stateStream)
        .finally(() => {
          expect(receivedSteps).toEqual(expectedSteps);
          const mockStepsByInstance = <jasmine.Spy> this.runServiceMock.getStepsByInstanceId;
          expect(subscriber.onError).toHaveBeenCalled();
          expect(mockStepsByInstance).not.toHaveBeenCalled();
          done();
        })
        .subscribe(steps => receivedSteps.push(steps), subscriber.onError);
    });

  });

  describe('::startAndMonitor', () => {

    it('State stream should get steps only for active and completed statuses', (done) => {
      const statusSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [
        RUN_STATUS_CODE.NOT_STARTED, RUN_STATUS_CODE.ACTIVE, RUN_STATUS_CODE.COMPLETED
      ]);
      setUpResponseSequence(<Spy>this.runServiceMock.getStatusByInstanceId, statusSequence);

      const stepSequence = [1, 2, 3, 4, 5].map(n => ({ steps: n }));
      setUpResponseSequence(<Spy>this.runServiceMock.getStepsByInstanceId, stepSequence);

      const emittedSteps = [];
      const subscriber = {
        onNext(next) {
          if (!_.isEqual(next.steps, _.last(emittedSteps))) {
            emittedSteps.push(next.steps);
          }
        },
        onComplete() {
        },
        onError(error) {
          console.error(error);
        }
      };
      spyOn(subscriber, 'onNext').and.callThrough();
      spyOn(subscriber, 'onComplete');
      spyOn(subscriber, 'onError').and.callThrough();

      spyOn(this.service, 'registerAndStartFlow').and
        .returnValue(ScalarObservable.create({ instanceId: '123', processId: '456' }));
      (<jasmine.Spy>this.runServiceMock.getInstance).and.returnValue(ScalarObservable.create({ name: 'instance mock' }));


      this.service.startAndMonitor({ useProcessId: '456', queryInterval: 1, maxTrials: 10 },
        processId => ScalarObservable.create({ id: '456' }))
        .state
        .finally(() => {
          const mockedMethod = <Spy>this.runServiceMock.getStepsByInstanceId;
          expect(mockedMethod).toHaveBeenCalledTimes(2);
          expect(mockedMethod.calls.allArgs()).toEqual([[this.DEFAULT_PROCESS_ID], [this.DEFAULT_PROCESS_ID]]);
          expect(this.service.registerAndStartFlow).toHaveBeenCalledTimes(1);

          expect(emittedSteps).toEqual([null, 1, 2]);

          expect(subscriber.onComplete).toHaveBeenCalled();
          // 4 = one for each status and one for each step of that status
          expect(subscriber.onNext).toHaveBeenCalledTimes(5);
          expect(subscriber.onError).not.toHaveBeenCalled();
          done();
        })
        .subscribe(
          subscriber.onNext,
          subscriber.onError,
          subscriber.onComplete
        );
    });

    it('State should emit as soon as the flow is registered', (done) => {
      const statusSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [
        RUN_STATUS_CODE.NOT_STARTED, RUN_STATUS_CODE.ACTIVE, RUN_STATUS_CODE.COMPLETED
      ]);
      setUpResponseSequence(<Spy>this.runServiceMock.getStatusByInstanceId, statusSequence);

      const stepSequence = [1, 2, 3, 4, 5].map(n => ({ steps: n }));
      setUpResponseSequence(<Spy>this.runServiceMock.getStepsByInstanceId, stepSequence);

      const emittedSteps = [];
      const subscriber = {
        onNext(next) {
          if (!_.isEqual(next.steps, _.last(emittedSteps))) {
            emittedSteps.push(next.steps);
          }
        },
        onComplete() {
        },
        onError(error) {
          console.error(error);
        }
      };
      spyOn(subscriber, 'onNext').and.callThrough();
      spyOn(subscriber, 'onComplete');
      spyOn(subscriber, 'onError').and.callThrough();

      spyOn(this.service, 'registerAndStartFlow').and
        .returnValue(ScalarObservable.create({ instanceId: '123', processId: '456' }));
      (<jasmine.Spy>this.runServiceMock.getInstance).and.returnValue(ScalarObservable.create({ name: 'instance mock' }));


      this.service.startAndMonitor({ useProcessId: '456', queryInterval: 1, maxTrials: 10 },
        processId => ScalarObservable.create({ id: '456' }))
        .state
        .finally(() => {
          const mockedMethod = <Spy>this.runServiceMock.getStepsByInstanceId;
          expect(mockedMethod).toHaveBeenCalledTimes(2);
          expect(mockedMethod.calls.allArgs()).toEqual([[this.DEFAULT_PROCESS_ID], [this.DEFAULT_PROCESS_ID]]);
          expect(this.service.registerAndStartFlow).toHaveBeenCalledTimes(1);

          expect(emittedSteps).toEqual([null, 1, 2]);

          expect(subscriber.onComplete).toHaveBeenCalled();
          // 4 = one for each status and one for each step of that status
          expect(subscriber.onNext).toHaveBeenCalledTimes(5);
          expect(subscriber.onError).not.toHaveBeenCalled();
          done();
        })
        .subscribe(
          subscriber.onNext,
          subscriber.onError,
          subscriber.onComplete
        );
    });

    it('State stream should catch an error response', (done) => {
      const statusSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [
        RUN_STATUS_CODE.NOT_STARTED, RUN_STATUS_CODE.ACTIVE, RUN_STATUS_CODE.FAILED
      ]);
      setUpResponseSequence(<Spy>this.runServiceMock.getStatusByInstanceId, statusSequence);

      const stepSequence = [1, 2, 3, 4, 5].map(n => ({ steps: n }));
      setUpResponseSequence(<Spy>this.runServiceMock.getStepsByInstanceId, stepSequence);
      spyOn(this.service, 'registerAndStartFlow').and
        .returnValue(ScalarObservable.create({ instanceId: '123', processId: '456' }));

      const emittedSteps = [];
      const subscriber = {
        onNext: (next) => {
          if (!_.isEqual(next.steps, _.last(emittedSteps))) {
            emittedSteps.push(next.steps);
          }
        },
        onError: (error) => {
          expect(error).toBeDefined('No error passed to callback');
          expect(error.name).toEqual(ERRORS.PROCESS_NOT_COMPLETED);
          expect(error.status).toEqual(RUN_STATUS_CODE.FAILED);
        }
      };
      spyOn(subscriber, 'onError').and.callThrough();

      this.service.startAndMonitor({ useProcessId: '456', queryInterval: 1, maxTrials: 10 },
        processId => ScalarObservable.create({ id: '456' }))
        .state
        .finally(() => {
          const mockedMethod = <Spy>this.runServiceMock.getStepsByInstanceId;
          expect(mockedMethod).toHaveBeenCalledTimes(1);
          expect(mockedMethod.calls.allArgs()).toEqual([[this.DEFAULT_PROCESS_ID]]);

          expect(emittedSteps).toEqual([null, 1]);

          expect(subscriber.onError).toHaveBeenCalled();
          done();
        })
        .subscribe(
          subscriber.onNext,
          subscriber.onError
        );
    });

  });

  function genStatusResponseSequence(id, statusValues: any[]): StatusResponse[] {
    return statusValues.map((status, trial) => ({ id, status, trial }));
  }

  function setUpResponseSequence(spy: jasmine.Spy, sequence: any[]) {
    const promiseSequence = sequence.map((value) => ScalarObservable.create(value));
    spy.and.returnValues(...promiseSequence);
  }

});
