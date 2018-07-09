import {
  assign,
  cloneDeep,
  chain,
  each,
  filter,
  get, set,
  isEmpty,
  isEqual,
  isFunction,
  isUndefined,
  isNil,
  isNull,
  map,
  noop,
  reduce,
  values
} from 'lodash';
import { tap, share, takeUntil, take, switchMap } from 'rxjs/operators';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MetadataAttribute,
  Task,
  LanguageService,
  ItemTask,
  Item,
  ItemSubflow,
  Dictionary,
  GraphNode,
  ItemActivityTask,
  NodeType,
  FlowGraph
} from '@flogo/core';
import { TriggersApiService, OperationalError } from '@flogo/core/services';
import { PostService } from '@flogo/core/services/post.service';
import { FlogoModal } from '@flogo/core/services/modal.service';
import { FlogoProfileService } from '@flogo/core/services/profile.service';

import {
  ERRORS as RUNNER_ERRORS,
  RunStateCode as RUNNER_STATE,
  RunStatusCode as RUNNER_STATUS,
  RunnerService,
  RunOptions,
  RunProgress,
  RunProgressStore,
  Step
} from './core/runner.service';
import { FlowData } from './core';

import { FlowMetadata } from './task-configurator/models/flow-metadata';

import {
  PUB_EVENTS as FLOGO_ADD_TASKS_SUB_EVENTS,
  SUB_EVENTS as FLOGO_ADD_TASKS_PUB_EVENTS
} from './task-add/messages';
import { SUB_EVENTS as FLOGO_SELECT_TASKS_PUB_EVENTS } from './task-detail/messages';
import {
  PUB_EVENTS as FLOGO_TASK_SUB_EVENTS,
  SUB_EVENTS as FLOGO_TASK_PUB_EVENTS
} from './shared/form-builder/messages';

import { AppsApiService } from '../core/services/restapi/v2/apps-api.service';
import { RESTAPIHandlersService } from '../core/services/restapi/v2/handlers-api.service';
import {
  FLOGO_PROFILE_TYPE,
  FLOGO_TASK_TYPE
} from '../core/constants';
import {
  isMapperActivity,
  isSubflowTask,
  notification,
} from '@flogo/shared/utils';

import { FlogoFlowService as FlowsService } from './core/flow.service';
import { ParamsSchemaComponent } from './params-schema/params-schema.component';
import { mergeItemWithSchema, extractItemInputsFromTask } from '@flogo/core/models';
import { DiagramSelection, DiagramAction, DiagramActionType } from '@flogo/packages/diagram';
import { DiagramActionChild, DiagramActionSelf, DiagramSelectionType } from '@flogo/packages/diagram/interfaces';
import { HandlerType, CurrentSelection, InsertTaskSelection, SelectionType } from './core/models';
import { FlowState } from './core/state';
import { makeNode } from './core/models/graph-and-items/graph-creator';
import { isBranchExecuted } from './core/models/flow/branch-execution-status';
import { SingleEmissionSubject } from '@flogo/core/models';
import { Trigger } from './core';
import { uniqueTaskName } from '@flogo/flow/core/models/unique-task-name';

export interface IPropsToUpdateFormBuilder {
  name: string;
}

interface TaskContext {
  isTrigger: boolean;
  isBranch: boolean;
  isTask: boolean;
  shouldSkipTaskConfigure: boolean;
  flowRunDisabled: boolean;
  hasProcess: boolean;
  isDiagramEdited: boolean;
  app: any;
  currentTrigger: any;
  profileType: FLOGO_PROFILE_TYPE;
}

const isSubflowItem = (item: Item): item is ItemSubflow => isSubflowTask(item.type);

@Component({
  selector: 'flogo-flow',
  templateUrl: 'flow.component.html',
  styleUrls: ['flow.component.less'],
})
export class FlowComponent implements OnInit, OnDestroy {
  @ViewChild('inputSchemaModal') defineInputSchema: ParamsSchemaComponent;
  public flowState: FlowState;
  public triggersList: Trigger[];
  public runnableInfo: {
    disabled: boolean;
    disableReason?: string;
  };

  private runState = {
    // data
    currentProcessId: <string> null,
    processInstanceId: <string> null,
    // TODO: may need better implementation
    lastProcessInstanceFromBeginning: <any> null,
    steps: <Step[]> null,
  };

  _subscriptions: any[];
  _id: any;

  _isCurrentProcessDirty = true;
  _isDiagramEdited: boolean;
  flowName: string;
  backToAppHover = false;

  profileType: FLOGO_PROFILE_TYPE;
  PROFILE_TYPES: typeof FLOGO_PROFILE_TYPE = FLOGO_PROFILE_TYPE;
  handlerTypes = HandlerType;

  currentDiagramSelection: DiagramSelection;

  public loading: boolean;
  public hasTrigger: boolean;
  public currentTrigger: any;
  public app: any;
  private ngOnDestroy$ = SingleEmissionSubject.create();

  constructor(public translate: LanguageService,
              private _postService: PostService,
              private _flowService: FlowsService,
              private triggersApiService: TriggersApiService,
              private _restAPIHandlerService: RESTAPIHandlersService,
              private _restAPIAppsService: AppsApiService,
              private _runnerService: RunnerService,
              private _router: Router,
              private _flogoModal: FlogoModal,
              private profileService: FlogoProfileService,
              private _route: ActivatedRoute) {
    this._isDiagramEdited = false;

    this.loading = true;
    this.hasTrigger = true;
    this.currentTrigger = null;
    this.app = null;
  }

  get flowId() {
    return this.flowDetails.id;
  }

  getSelectionFor(handlerType) {
    if (this.currentDiagramSelection && this.currentDiagramSelection.diagramId === handlerType) {
      return this.currentDiagramSelection;
    } else {
      return null;
    }
  }

  public ngOnInit() {
    const flowData: FlowData = this._route.snapshot.data['flowData'];
    this.flowDetails
      .flowState$
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(flowState => this.onFlowStateUpdate(flowState));
    this.initFlowData(flowData);
    this.flowDetails
      .selectionChange$
      .pipe(
        share(),
        takeUntil(this.ngOnDestroy$),
      )
      .subscribe(selection => this.onSelectionChanged(selection));
    this.flowDetails.runnableState$
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(runnableState => this.runnableInfo = runnableState);
    this.flowDetails.itemsChange$
      .pipe(
        takeUntil(this.ngOnDestroy$),
        switchMap(() => this.flowDetails.flowState$.pipe(take(1))),
      )
      .subscribe(state => this.onItemsChange(state));
    this.initSubscribe();
    this.loading = false;
  }

  private initSubscribe() {
    this._subscriptions = [];

    const subs = [
      assign({}, FLOGO_ADD_TASKS_SUB_EVENTS.addTask, { callback: this._addTaskFromTasks.bind(this) }),
      assign({}, FLOGO_TASK_SUB_EVENTS.runFromThisTile, { callback: this._runFromThisTile.bind(this) }),
      assign({}, FLOGO_TASK_SUB_EVENTS.taskDetailsChanged, { callback: this._taskDetailsChanged.bind(this) }),
      assign({}, FLOGO_TASK_SUB_EVENTS.changeTileDetail, { callback: this._changeTileDetail.bind(this) }),
    ];

    each(
      subs, sub => {
        this._subscriptions.push(this._postService.subscribe(sub));
      }
    );
  }

  onMainDiagramAction(diagramAction: DiagramAction) {
    this.onDiagramAction(HandlerType.Main, diagramAction);
  }

  onErrorDiagramAction(diagramAction: DiagramAction) {
    this.onDiagramAction(HandlerType.Error, diagramAction);
  }

  private get flowDetails() {
    return this._flowService.currentFlowDetails;
  }

  private onDiagramAction(handlerType: HandlerType, diagramAction: DiagramAction) {
    const flowDetails = this.flowDetails;
    switch (diagramAction.type) {
      case DiagramActionType.Select: {
        flowDetails.selectItem(handlerType, (<DiagramActionSelf>diagramAction).id);
        return;
      }
      case DiagramActionType.Configure: {
        flowDetails.configureItem((<DiagramActionSelf>diagramAction).id);
        return;
      }
      case DiagramActionType.Remove: {
        this._deleteTaskFromDiagram(handlerType, (<DiagramActionSelf>diagramAction).id);
        return;
      }
      case DiagramActionType.Insert: {
        flowDetails.selectInsert(handlerType, (<DiagramActionChild>diagramAction).parentId);
        return;
      }
      case DiagramActionType.Branch: {
        flowDetails.createBranch(handlerType, (<DiagramActionChild>diagramAction).parentId);
        return;
      }
    }
  }

  private onSelectionChanged(selection: CurrentSelection) {
    this.currentDiagramSelection = null;
    if (!selection) {
      if (this.isTaskSubroute()) {
        this._navigateFromModuleRoot();
      }
    } else if (selection.type === SelectionType.Task) {
      this.currentDiagramSelection = {
        type: DiagramSelectionType.Node,
        taskId: selection.taskId,
        diagramId: selection.handlerType,
      };
      this._selectTaskFromDiagram(selection.taskId);
    } else if (selection.type === SelectionType.InsertTask) {
      this.currentDiagramSelection = {
        type: DiagramSelectionType.Insert,
        taskId: selection.parentId,
        diagramId: selection.handlerType,
      };
      this._addTaskFromDiagram(selection.parentId);
    }
  }

  private isTaskSubroute() {
    const [firstRouteChild] = this._route.children;
    return firstRouteChild && firstRouteChild.routeConfig.path.startsWith('task/');
  }

  private onItemsChange(nextState: FlowState) {
    this.refreshCurrentTileContextIfNeeded();
    this._flowService.saveFlowIfChanged(this.flowId, nextState)
      .subscribe(updated => {
        if (updated && !this._isCurrentProcessDirty) {
          this._isCurrentProcessDirty = true;
        }
        console.log('flowSaved?', updated);
      });
  }

  private onFlowStateUpdate(nextState: FlowState) {
    const prevState = this.flowState;
    this.flowState = nextState;
    if (prevState && prevState.isErrorPanelOpen !== nextState.isErrorPanelOpen) {
      // todo: this shouldn't be necessary once we move away from route based state
      this._navigateFromModuleRoot();
    }
  }

  ngOnDestroy() {
    this.ngOnDestroy$.emitAndComplete();
    each(this._subscriptions, sub => {
        this._postService.unsubscribe(sub);
      }
    );
  }

  deleteFlow() {
    this.translate.get('FLOWS:CONFIRM_DELETE', { flowName: this.flowState.name })
      .toPromise()
      .then(deleteMessage => this._flogoModal.confirmDelete(deleteMessage))
      .then((res) => {
        if (res) {
          const appPromise = (this.app) ? Promise.resolve(this.app) : this._restAPIAppsService.getApp(this.flowState.app.id);
          appPromise
            .then((app) => {
              const triggerDetails = this.getTriggerCurrentFlow(app, this.flowState.id);
              return this._flowService.deleteFlow(this.flowId, triggerDetails ? triggerDetails.id : null);
            })
            .then(() => {
              this.navigateToApp();
            })
            .then(() => this.translate.get('FLOWS:SUCCESS-MESSAGE-FLOW-DELETED').toPromise())
            .then(message => notification(message, 'success', 3000))
            .catch(err => {
              console.error(err);
              this.translate.get('FLOWS:ERROR-MESSAGE-REMOVE-FLOW', err)
                .subscribe(message =>  notification(message, 'error'));
            });
        }
      });
  }

  private refreshCurrentTileContextIfNeeded() {
    const selection = this.flowState.currentSelection;
    if (!selection || selection.type !== SelectionType.Task) {
      return;
    }
    const { taskId } = selection;
    const context = this._getCurrentTaskContext(taskId);
    this._postService.publish(Object.assign(
      {},
      FLOGO_SELECT_TASKS_PUB_EVENTS.taskContextUpdated,
      { data: { taskId, context } }
      ));
  }

  private initFlowData(flowData: FlowData) {
    this.flowName = flowData.flow.name;
    this.triggersList = flowData.triggers;
    this.profileService.initializeProfile(flowData.flow.app);
    this.profileType = this.profileService.currentApplicationProfile;
  }

  private _getCurrentState(taskID: string) {
    const steps = this.runState.steps || [];
    // allow double equal check for legacy ids that were type number
    /* tslint:disable-next-line:triple-equals */
    return steps.find(step => taskID == step.taskId);
  }

  private uniqueTaskName(taskName: string) {
    return uniqueTaskName(
      taskName,
      this.flowState.mainItems,
      this.flowState.errorItems
    );
  }

  private _getCurrentTaskContext(taskId: any): TaskContext {
    const handlerId = this.getDiagramId(taskId);
    const taskType = this.getTaskInHandler(handlerId, taskId).type;
    return {
      isTrigger: false, // taskType === FLOGO_TASK_TYPE.TASK_ROOT,
      isBranch: taskType === FLOGO_TASK_TYPE.TASK_BRANCH,
      isTask: taskType === FLOGO_TASK_TYPE.TASK || taskType === FLOGO_TASK_TYPE.TASK_SUB_PROC,
      shouldSkipTaskConfigure: this.isTaskSubflowOrMapper(taskId, handlerId),
      flowRunDisabled: this.runnableInfo && this.runnableInfo.disabled,
      hasProcess: Boolean(this.runState.currentProcessId),
      isDiagramEdited: this._isDiagramEdited,
      app: null,
      currentTrigger: null,
      profileType: this.profileType
    };
  }

  private getItemsByHandlerId(id: string) {
    return id === HandlerType.Main ? this.flowState.mainItems : this.flowState.errorItems;
  }

  private getTaskInHandler(handlerId: string, taskId: string) {
    return this.getItemsByHandlerId(handlerId)[taskId];
  }

  private isTaskSubflowOrMapper(taskId: any, diagramId: string): boolean {
    const currentTask = <ItemTask> this.getTaskInHandler(diagramId, taskId);
    const activitySchema = this.flowState.schemas[currentTask.ref];
    return isSubflowTask(currentTask.type) || isMapperActivity(activitySchema);
  }

  /**
   *
   * @param urlParts empty to navigate to module root
   * @returns {Promise<boolean>}
   * @private
   */
  private _navigateFromModuleRoot(urlParts = []) {
    return this._router.navigate(['/flows', this.flowId, ...urlParts]);
  }

  /*-------------------------------*
   |       DESIGN FLOW              |
   *-------------------------------*/

  public changeFlowDetail($event, property) {
    return this._updateFlow()
      .then(wasSaved => {
        if (wasSaved) {
          this.translate
            .get('CANVAS:SUCCESS-MESSAGE-UPDATE', { value: property })
            .subscribe(message => notification(message, 'success', 3000));
        }
        return wasSaved;
      })
      .catch(() => this.translate
          .get('CANVAS:ERROR-MESSAGE-UPDATE', { value: property })
          .subscribe(errorMsg => notification(errorMsg, 'error'))
      );
  }

  /**
   * @deprecated state should be updated instead but supporting this for now for old modules
   */
  private _updateFlow() {
    return this._flowService
      .saveFlowIfChanged(this.flowId, this.flowState)
      .toPromise();
  }

  public changeFlowDetailName(name, property) {
    if (name === this.flowName) {
      return Promise.resolve(true);
    }

    return this._flowService.listFlowsByName(this.flowState.appId, name)
      .then((flows) => {
        const results = flows || [];
        if (!isEmpty(results)) {
          if (results[0].id === this.flowId) {
            return;
          }
          const message = this.translate.instant('CANVAS:FLOW-NAME-EXISTS', { value: name });
          this.flowState.name = this.flowName;
          notification(message, 'error');
          return results;
        } else {
          this.flowState.name = name;
          this._updateFlow()
            .then((response: any) => {
              this.translate.get('CANVAS:SUCCESS-MESSAGE-UPDATE', { value: property })
                .subscribe(message =>    notification(message, 'success', 3000));
              this.flowName = this.flowState.name;
              return response;
            }).catch((err) => {
              const message = this.translate
                .get('CANVAS:ERROR-MESSAGE-UPDATE', { value: property })
                .subscribe(errorMsg =>  notification(errorMsg, 'error'));
              return Promise.reject(err);
            });
        }
      })
      .catch((err) => {
        const message = this.translate.instant('CANVAS:ERROR-MESSAGE-UPDATE', { value: property });
        notification(message, 'error');
        return Promise.reject(err);
      });
  }

  private _addTaskFromDiagram(parentId: string) {
    this._navigateFromModuleRoot(['task', 'add'])
      .then(
        () => {
          this._postService.publish({
            ...FLOGO_ADD_TASKS_PUB_EVENTS.addTask,
            data: {
              parentId
            }
          });
        });
  }

  private _addTaskFromTasks(data: any, envelope: any) {
    const currentState = this.flowState;
    const selection = currentState.currentSelection as InsertTaskSelection;
    const isAddingToRoot = selection && !selection.parentId;
    let diagramId: string;
    if (isAddingToRoot) {
      diagramId = selection.handlerType;
    } else {
      diagramId = this.getDiagramId(data.parentId);
    }

    let task = data.task;
    const taskName = this.uniqueTaskName(data.task.name);
    // generate task id when adding the task
    task = <Task> assign({},
      task,
      {
        id: this.profileService.generateTaskID(this._getAllTasks(), task),
        name: taskName
      });

    let item: ItemActivityTask | ItemSubflow = {
      id: task.id,
      type: task.type,
      ref: task.ref,
      name: taskName,
      description: task.description,
      inputMappings: task.inputMappings,
      input: extractItemInputsFromTask(task),
      settings: task.settings,
    };
    const isSubflow = isSubflowItem(item);
    if (isSubflow) {
      item = {
        ...item,
        outputMappings: task.outputMappings,
      } as ItemSubflow;
    } else {
      (<ItemActivityTask>item).return = task.return;
    }
    const schema = task.__schema;
    const isFinal = !!task.return;
    const node = makeNode({
      id: task.id,
      type: NodeType.Task,
      title: task.name,
      description: task.description,
      parents: [selection.parentId],
      features: {
        subflow: isSubflow,
        final: isFinal,
        canHaveChildren: !isFinal
      }
    });

    this.flowDetails.registerNewItem(
      this.handlerTypeFromString(diagramId),
      { item, node, schema },
    );
  }

  private getTriggerCurrentFlow(app, flowId) {
    let trigger: any = null;
    const triggersForCurrentApp = app.triggers.filter(t => t.appId === app.id);

    // todo: unnecessary, app.triggers.filter is true?
    if (triggersForCurrentApp) {
      triggersForCurrentApp.forEach((currentTrigger) => {
        const handlers = currentTrigger.handlers.find((handler) => {
          return handler.actionId === flowId;
        });

        if (handlers) {
          trigger = currentTrigger;
          return trigger;
        }
      });
    }
    return trigger;
  }

  private _selectTaskFromDiagram(taskId: string) {
    const handlerId = this.getDiagramId(taskId);

    // Refresh task detail
    const currentStep = this._getCurrentState(taskId);
    const context = this._getCurrentTaskContext(taskId);

    const currentItem = <Item> cloneDeep(this.getTaskInHandler(handlerId, taskId));
    let currentTask;
    if (currentItem.type === FLOGO_TASK_TYPE.TASK_BRANCH) {
      currentTask = cloneDeep(currentItem);
    } else {
      // schema == {} for subflow case
      const activitySchema = this.flowState.schemas[currentItem.ref] || <any>{};
      currentTask = mergeItemWithSchema(currentItem, activitySchema);
    }
    this._navigateFromModuleRoot(['task', taskId])
      .then(
        () => {
          this.openTaskDetail(currentTask, currentStep, context);
        }
      );
  }

  private openTaskDetail(
    currentTask: Task,
    currentStep: Step,
    context: TaskContext,
  ) {
    this._postService.publish(
      assign(
        {}, FLOGO_SELECT_TASKS_PUB_EVENTS.selectTask, {
          data: assign({},
            // data,
            { task: currentTask, step: currentStep, context }
          ),
        }
      )
    );
  }

  private _changeTileDetail(data: {
    content: string;
    proper: string;
    taskId: any,
    id: string,
    tileType: string
  }, envelope: any) {
    if (data.tileType !== 'activity') {
      return;
    }

    const task = <ItemTask> this.getTaskInHandler(data.id, data.taskId);
    if (!task) {
      return;
    }

    let item;
    let node;
    if (data.proper === 'name') {
      const uniqueName = this.uniqueTaskName(data.content);
      item = { id: data.taskId, name: uniqueName };
      node = { id: data.taskId, title: uniqueName };
    } else {
      item = { id: data.taskId, [data.proper]: data.content };
      node = { id: data.taskId, [data.proper]: data.content };
    }
    this.flowDetails.updateItem(this.handlerTypeFromString(data.id), { item, node });

    const updateObject = {};
    const propsToUpdateFormBuilder: IPropsToUpdateFormBuilder = <IPropsToUpdateFormBuilder> {};
    propsToUpdateFormBuilder.name = task.name;

    this._postService.publish(
      assign(
        {}, FLOGO_TASK_PUB_EVENTS.updatePropertiesToFormBuilder, {
          data: propsToUpdateFormBuilder
        }
      )
    );

    // TODO: used?
    if (<any>task.type === FLOGO_TASK_TYPE.TASK_ROOT) {
      updateObject[data.proper] = task[data.proper];
      this.triggersApiService.updateTrigger(this.currentTrigger.id, updateObject);
    }
  }

  private findItemById(taskId: string) {
    return this.getTaskInHandler(this.getDiagramId(taskId), taskId);
  }

  private _deleteTaskFromDiagram(handlerType: HandlerType, taskId: string) {
    const task = this.findItemById(taskId);
    if (!task) {
      return;
    }
    this._flogoModal.confirmDelete('Are you sure you want to delete this task?')
      .then((confirmed) => {
        if (!confirmed) {
          return;
        }
        this._isDiagramEdited = true;
        if (isSubflowItem(task)) {
          this.manageFlowRelationships(task.settings.flowPath);
        }
        this.flowDetails.removeItem(handlerType, taskId);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  private _taskDetailsChanged(data: any, envelope: any) {
    const handlerId = this.getDiagramId(data.taskId);
    const task = this.getTaskInHandler(handlerId, data.taskId);

    const changes: { item: {id: string} & Partial<Item>, node:  {id: string} & Partial<GraphNode> } = <any>{};
    if (task.type === FLOGO_TASK_TYPE.TASK) {
      const changedInputs = data.inputs || {};
      if (isEqual(changedInputs, task.input)) {
        return;
      }
      changes.item = {
        id: task.id,
        input: { ...changedInputs  }
      };
    } else if (task.type === FLOGO_TASK_TYPE.TASK_BRANCH) { // branch
      if (isEqual(data.condition, task.condition)) {
        return;
      }
      changes.item = {
        id: task.id,
        condition: data.condition,
      };
    }

    if (isFunction(envelope.done)) {
      envelope.done();
    }

    this.flowDetails.updateItem(
      this.handlerTypeFromString(handlerId),
      changes,
    );
  }

  private _getAllTasks() {
    return {...this.flowState.mainItems, ...this.flowState.errorItems};
  }

  /*-------------------------------*
   |      RUN FLOW                 |
   *-------------------------------*/

  private _runFromRoot() {

    this._isDiagramEdited = false;
    this.cleanDiagramRunState();

    // The initial data to start the process from trigger
    const initData = this.getInitDataForRoot();
    const runOptions: RunOptions = { attrsData: initData };
    const shouldUpdateFlow = this._isCurrentProcessDirty || !this.runState.currentProcessId;
    if (shouldUpdateFlow) {
      runOptions.useFlow = this.flowState;
    } else {
      runOptions.useProcessId = this.runState.currentProcessId;
    }

    this.runState.steps = null;
    const runner = this._runnerService.runFromRoot(runOptions);

    runner.registered.subscribe(info => {
      this.runState.currentProcessId = info.processId;
      this.runState.processInstanceId = info.instanceId;
    }, noop); // TODO: remove when fixed https://github.com/ReactiveX/rxjs/issues/2180);

    return this.observeRunProgress(runner)
      .then((runState: RunProgress) => {
        this.runState.lastProcessInstanceFromBeginning = runState.lastInstance;
        return runState;
      })
      .catch(err => this.handleRunError(err));
  }


  // TODO
  //  to do proper restart process, need to select proper snapshot, hence
  //  the current implementation is only for the last start-from-beginning snapshot, i.e.
  //  the using this.runState.processInstanceId to restart
  private _runFromThisTile(data: any, envelope: any) {
    console.group('Run from this tile');

    const selectedTask = this.flowState.mainItems[data.taskId];

    if (!this.runState.processInstanceId) {
      // run from other than the trigger (root task);
      // TODO
      console.warn('Cannot find proper step to restart from, skipping...');
      return;
    }
    const step = this._getStepNumberFromSteps(data.taskId);

    if (!step) {
      // TODO
      //  handling the case that trying to start from the middle of a path without run from the trigger for the first time.
      console.error(`Cannot start from task ${(<any>selectedTask).name} (${selectedTask.id})`);
      return;
    }

    const attrs = get(selectedTask, 'attributes.inputs');
    const dataOfInterceptor = {
      tasks: [{
        id: selectedTask.id,
        inputs: parseInput(attrs, data.inputs),
      }]
    };

    this.runState.steps = null;
    this.clearAllHandlersRunStatus();

    const runner = this._runnerService.rerun({
      useFlow: this.flowState,
      interceptor: dataOfInterceptor,
      step: step,
      instanceId: this.runState.processInstanceId,
    });

    this.observeRunProgress(runner)
      .then(() => {
        if (isFunction(envelope.done)) {
          envelope.done();
        }
        this.refreshCurrentSelectedTaskIfNeeded();
      })
      .catch(err => this.handleRunError(err));

    console.groupEnd();

    function parseInput(formAttrs: any, inputData: any) {
      if (!formAttrs) {
        return [];
      }
      return map(formAttrs, (input: any) => {
        // override the value;
        return assign(cloneDeep(input), {
          value: inputData[input.name],
          type: input.type
        });
      });
    }

  }

  // monitor the status of a process till it's done or up to the max trials
  private observeRunProgress(runner: RunProgressStore): Promise<RunProgress | void> {

    // TODO: remove noop when fixed https://github.com/ReactiveX/rxjs/issues/2180
    runner.processStatus
      .subscribe(processStatus => this.logRunStatus(processStatus), noop);

    // TODO: only on run from trigger?
    runner.registered.subscribe(info => {
      this._isCurrentProcessDirty = false;
    }, noop); // TODO: remove when fixed https://github.com/ReactiveX/rxjs/issues/2180);

    runner.steps
      .subscribe(steps => {
        if (steps) {
          this.runState.steps = steps;
          this.updateTaskRunStatus(steps, {});
        }
      }, noop); // TODO: remove when fixed https://github.com/ReactiveX/rxjs/issues/2180

    return runner.completed.pipe(
      tap(state => {
        this.runState.steps = state.steps;
        const message = this.translate.instant('CANVAS:SUCCESS-MESSAGE-COMPLETED');
        notification(message, 'success', 3000);
      }))
      .toPromise();

  }

  private logRunStatus(processStatus) {
    switch (processStatus.status) {
      case RUNNER_STATUS.NotStarted:
        console.log(`[PROC STATE][${processStatus.trial}] Process has not started.`);
        break;
      case RUNNER_STATUS.Active:
        console.log(`[PROC STATE][${processStatus.trial}] Process is running...`);
        break;
      case RUNNER_STATUS.Completed:
        console.log(`[PROC STATE][${processStatus.trial}] Process finished.`);
        break;
      case null:
        break;
      default:
        console.warn(`[PROC STATE][${processStatus.trial}] Unknown status.`);
    }
  }

  private cleanDiagramRunState() {
    // clear task status and render the diagram
    this.clearAllHandlersRunStatus();
    // this._postService.publish(FLOGO_DIAGRAM_PUB_EVENTS.render);
  }

  private getInitDataForRoot(): { name: string; type: string; value: any }[] {
    const flowInput = get(this.flowState, 'metadata.input');
    if (isEmpty(flowInput)) {
      return undefined;
    }
    // preprocessing initial data
    return chain(flowInput)
      .filter((item: any) => {
        // filter empty values
        return !isNil(item.value);
      })
      .map((item: any) => cloneDeep(item))
      .value();
  }

  private handleRunError(error) {
    console.error(error);
    // todo: more specific error message?
    let message = null;
    if (error.isOperational) {
      const opError = <OperationalError> error;
      if (opError.name === RUNNER_ERRORS.PROCESS_NOT_COMPLETED) {
        // run error instance has status prop hence the casting to any
        message = (<any>opError).status === RUNNER_STATUS.Cancelled ? 'CANVAS:RUN-ERROR:RUN-CANCELLED' : 'CANVAS:RUN-ERROR:RUN-FAILED';
      } else if (opError.name === RUNNER_ERRORS.MAX_TRIALS_REACHED) {
        message = 'CANVAS:RUN-ERROR:MAX-REACHED';
      }
    }

    message = message || 'CANVAS:ERROR-MESSAGE';
    notification(this.translate.instant(message), 'error');
    return error;
  }

  private clearAllHandlersRunStatus() {
    this.flowDetails.clearExecutionStatus();
  }

  private updateTaskRunStatus(steps: Step[], rsp: any) {
    let isErrorHandlerTouched = false;
    const { isFlowDone, runTasks, runTaskIds, errors } = this.extractExecutionStatus(steps);

    let allStatusChanges = {
      mainGraphNodes: {} as Dictionary<GraphNode>,
      errorGraphNodes: {} as Dictionary<GraphNode>,
    };

    runTaskIds.forEach(taskId => {
      let node = this.flowState.mainGraph.nodes[taskId];
      let changeAccumulator = allStatusChanges.mainGraphNodes;
      if (isEmpty(node)) {
        node = this.flowState.errorGraph.nodes[taskId];
        changeAccumulator = allStatusChanges.errorGraphNodes;
        isErrorHandlerTouched = !!node;
      }
      if (node) {
        const taskErrors = errors[node.id];
        changeAccumulator[node.id] = {
          ...node,
          status: {
            ...node.status,
            executed: true,
            executionErrored: !isUndefined(taskErrors) ? Object.values(taskErrors).map(err => err.msg) : null,
          },
        };
      }
    });

    const filterBranches = (nodes: Dictionary<GraphNode>) => [...Object.values(nodes)].filter(node => node.type === NodeType.Branch);
    const branchUpdates = (nodes: FlowGraph['nodes']) => filterBranches(nodes)
      .reduce((changes, branchNode) => {
        const branchWasExecuted = isBranchExecuted(branchNode, nodes);
        if (branchWasExecuted && !nodes[branchNode.id].status.executed) {
          changes[branchNode.id] = {
            ...branchNode,
            status: {
              ...branchNode.status,
              executed: true,
            },
          };
        }
        return changes;
      }, {});

    allStatusChanges = {
      mainGraphNodes: {
        ...allStatusChanges.mainGraphNodes,
        ...branchUpdates({ ...this.flowState.mainGraph.nodes, ...allStatusChanges.mainGraphNodes }),
      },
      errorGraphNodes: {
        ...allStatusChanges.errorGraphNodes,
        ...branchUpdates({ ...this.flowState.errorGraph.nodes, ...allStatusChanges.errorGraphNodes }),
      }
    };

    set(rsp, '__status', {
      isFlowDone: isFlowDone,
      errors: errors,
      runTasks: runTasks,
      runTasksIDs: runTaskIds
    });

    this.flowDetails.executionStatusChanged(allStatusChanges);

    // when the flow is done on error, throw an error
    // the error is the response with `__status` provisioned.
    if (isFlowDone && !isEmpty(errors)) {
      throw rsp;
    }

    // TODO
    //  how to verify if a task is running?
    //    should be the next task downstream the last running task
    //    but need to find the node of that task in the diagram

  }

  private extractExecutionStatus(steps: Step[]) {
    let isFlowDone = false;
    const runTaskIds = [];
    const errors = <{
      [index: string]: {
        msg: string;
        time: string;
      }[];
    }>{};
    const runTasks = reduce(steps, (result: any, step: any) => {
      const taskID = step.taskId;

      if (taskID !== 'root' && taskID !== 1 && !isNil(taskID)) {

        /****
         *  Exclude the tasks which are skipped by the engine while running the flow
         *  but their running task information is generated and maintained
         ****/
        const taskState = step.taskState || 0;
        if (taskState !== RUNNER_STATE.Skipped) {
          runTaskIds.push(taskID);
        }
        const reAttrName = new RegExp(`^_A.${step.taskId}\\..*`, 'g');
        const reAttrErrMsg = new RegExp(`^_E.message`, 'g');

        const taskInfo = reduce(get(step, 'flow.attributes', []),
          (currentTaskInfo: any, attr: any) => {
            if (reAttrName.test(get(attr, 'name', ''))) {
              currentTaskInfo[attr.name] = attr;
            }

            if (reAttrErrMsg.test(attr.name)) {
              let errs = <any[]>get(errors, `${taskID}`);
              const shouldOverride = isUndefined(errs);
              errs = errs || [];

              errs.push({
                msg: attr.value,
                time: new Date().toJSON()
              });

              if (shouldOverride) {
                set(errors, `${taskID}`, errs);
              }
            }
            return currentTaskInfo;
          }, {});

        result[taskID] = {attrs: taskInfo};
      } else if (isNull(taskID)) {
        isFlowDone = true;
      }

      return result;
    }, {});
    return { isFlowDone, runTasks, runTaskIds, errors };
  }

  // TODO
  //  get step index logic should be based on the selected snapshot,
  //  hence need to be refined in the future
  private _getStepNumberFromSteps(taskId: string) {
    let stepNumber = 0;
    // firstly try to get steps from the last process instance running from the beginning,
    // otherwise use some defauts
    const steps = get(this.runState.lastProcessInstanceFromBeginning, 'steps', this.runState.steps || []);

    steps.forEach((step: any, index: number) => {
      // allowing double equals for legacy ids that were of type number
      /* tslint:disable-next-line:triple-equals */
      if (step.taskId == taskId) {
        stepNumber = index + 1;
      }
    });

    return stepNumber;
  }

  /*-------------------------------*
   |      APP NAVIGATION           |
   *-------------------------------*/

  public navigateToApp() {
    this._router.navigate(['/apps', this.flowState.appId]);
  }

  public onMouseOverBackControl() {
    this.backToAppHover = true;
  }

  public onMouseOutBackControl() {
    this.backToAppHover = false;
  }

  public openInputSchemaModal() {
    this.defineInputSchema.openInputSchemaModel();
  }

  onRunFlow(modifiedInputs: MetadataAttribute[]) {
    let flowUpdatePromise;
    if (modifiedInputs.length) {
      this.flowState.metadata.input = modifiedInputs;
      flowUpdatePromise = this._updateFlow();
    } else {
      flowUpdatePromise = Promise.resolve(this.flowState);
    }
    flowUpdatePromise.then(() => this._runFromRoot())
      .then(() => {
        this.refreshCurrentSelectedTaskIfNeeded();
      });
  }

  private refreshCurrentSelectedTaskIfNeeded() {
    const currentSelection = this.flowState.currentSelection;
    if (!currentSelection || currentSelection.type !== SelectionType.Task) {
      return;
    }
    const taskId = currentSelection.taskId;
    const diagramId = this.getDiagramId(taskId);
    if (diagramId) {
      this._selectTaskFromDiagram(taskId);
    }
  }

  private getDiagramId(taskId: string): string {
    if (this.getTaskInHandler(HandlerType.Main, taskId)) {
      return HandlerType.Main;
    } else if (this.getTaskInHandler(HandlerType.Error, taskId)) {
      return HandlerType.Error;
    }
    // todo: throw error?
    return null;
  }

  private handlerTypeFromString(handlerTypeName: string): HandlerType {
    return handlerTypeName === HandlerType.Main ? HandlerType.Main : HandlerType.Error;
  }

  public onFlowSchemaSave(newMetadata: FlowMetadata) {
    this.flowState.metadata.input = this.mergeFlowInputMetadata(newMetadata.input);
    this.flowState.metadata.output = newMetadata.output;

    const propCollectionToRegistry = (from) => new Map(<Array<[string, boolean]>>from.map((o: any) => [o.name, true]));

    const outputRegistry = propCollectionToRegistry(newMetadata.output);
    const inputRegistry = propCollectionToRegistry(newMetadata.input);
    this.cleanDanglingTaskOutputMappings(outputRegistry);

    this.cleanDanglingTriggerMappingsToFlow(inputRegistry);
    this._updateFlow();
  }

  private mergeFlowInputMetadata(inputMetadata: MetadataAttribute[]): MetadataAttribute[] {
    return inputMetadata.map(input => {
      const existingInput = this.flowState.metadata.input.find(i => i.name === input.name && i.type === input.type);
      if (existingInput) {
        input.value = existingInput.value;
      }
      return input;
    });
  }

  // when flow schema's input change we need to remove the trigger mappings that were referencing them
  private cleanDanglingTriggerMappingsToFlow(inputRegistry: Map<string, boolean>) {
    const isApplicableMapping = (mapping) => inputRegistry.has(mapping.mapTo);
    const handlersToUpdate = this.triggersList.reduce((result, trigger) => {
      const handlersToUpdateInTrigger = trigger.handlers
        .filter(handler => handler.actionId === this.flowId)
        .reduce(reduceToUpdatableHandlers, [])
        .map(handler => ({ handler, triggerId: trigger.id }));
      return result.concat(handlersToUpdateInTrigger);
    }, []);
    if (handlersToUpdate.length > 0) {
      return Promise.all(handlersToUpdate.map(({ handler, triggerId }) => {
        return this._restAPIHandlerService.updateHandler(triggerId, this.flowId, handler);
      }));
    }
    return Promise.resolve();

    function reduceToUpdatableHandlers(result, handler) {
      const actionInputMappings = get(handler, 'actionMappings.input', []);
      const applicableMappings = actionInputMappings.filter(isApplicableMapping);
      if (applicableMappings.length !== actionInputMappings.length) {
        handler.actionMappings.input = applicableMappings;
        result.push(handler);
      }
      return result;
    }
  }

  // when flow schema's output change we need to remove the task mappings that were referencing them
  private cleanDanglingTaskOutputMappings(outputRegistry: Map<string, boolean>) {
    const isMapperContribAndHasMapping = (task: Task) => {
      const schema = this.flowState.schemas[task.ref];
      const inputs = (task.attributes || {}).inputs || [];
      return isMapperActivity(schema) && inputs.length > 0;
    };
    filter(this._getAllTasks(), isMapperContribAndHasMapping)
      .forEach((task: Task) => {
        task.attributes.inputs.forEach((mapping) => {
          mapping.value = mapping.value.filter((m) => outputRegistry.has(m.mapTo));
        });
      });
  }

  private manageFlowRelationships(flowId: string) {
    if (!this.isFlowUsedAgain(flowId)) {
      this.flowDetails.deleteSubflowSchema(flowId);
    }
  }

  private isFlowUsedAgain(id: string) {
    return !!values(this._getAllTasks()).find((t: ItemSubflow) => t.settings && t.settings.flowPath === id);
  }

}
