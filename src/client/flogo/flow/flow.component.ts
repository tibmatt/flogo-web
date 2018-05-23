import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import * as _ from 'lodash';
import { filter, share, takeUntil, withLatestFrom } from 'rxjs/operators';

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
import {
  PUB_EVENTS as FLOGO_TRANSFORM_SUB_EVENTS,
  SelectTaskConfigEventData,
  SUB_EVENTS as FLOGO_TRANSFORM_PUB_EVENTS
} from './task-configurator/messages';

import { AppsApiService } from '../core/services/restapi/v2/apps-api.service';
import { RESTAPIHandlersService } from '../core/services/restapi/v2/handlers-api.service';
import {
  FLOGO_PROFILE_TYPE,
  FLOGO_TASK_TYPE
} from '../core/constants';
import {
  isIterableTask,
  isMapperActivity,
  isSubflowTask,
  normalizeTaskName,
  notification,
} from '@flogo/shared/utils';

import { FlogoFlowService as FlowsService } from './core/flow.service';
import { ParamsSchemaComponent } from './params-schema/params-schema.component';
import { SaveTaskConfigEventData } from './task-configurator';
import { mergeItemWithSchema, extractItemInputsFromTask, PartialActivitySchema } from '@flogo/core/models';
import { DiagramSelection, DiagramAction, DiagramActionType } from '@flogo/packages/diagram';
import { DiagramActionChild, DiagramActionSelf, DiagramSelectionType } from '@flogo/packages/diagram/interfaces';
import { HandlerType } from './core/models';
import { FlowState } from './core/state';
import { makeNode } from './core/models/graph-and-items/graph-creator';
import { makeErrorTask } from './core/models/make-error-task';
import { isBranchExecuted } from './core/models/flow/branch-execution-status';
import { SingleEmissionSubject } from '@flogo/core/models';
import {Trigger} from './core';

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
  styleUrls: ['flow.component.less']
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

  public ngOnInit() {
    const flowData: FlowData = this._route.snapshot.data['flowData'];
    this.flowDetails
      .flowState$
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(flowState => this.onFlowStateUpdate(flowState));
    this.initFlowData(flowData);
    const selection$ = this.flowDetails
      .selectionChange$
      .pipe(
        share(),
        takeUntil(this.ngOnDestroy$),
      );
    selection$
      .subscribe(selection => this.onSelectionChanged(selection));
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        withLatestFrom(selection$),
        takeUntil(this.ngOnDestroy$),
      )
      .subscribe(([event, selection]) => {
        // needed from where trigger changes the url
        // todo: should invert data flow and change should come from state
        if (!this.isTaskSubroute() && selection) {
          this.flowDetails.clearSelection();
        }
      });
    this.initSubscribe();
    this.loading = false;
  }

  private initSubscribe() {
    this._subscriptions = [];

    const subs = [
      _.assign({}, FLOGO_ADD_TASKS_SUB_EVENTS.addTask, { callback: this._addTaskFromTasks.bind(this) }),
      _.assign({}, FLOGO_TASK_SUB_EVENTS.runFromThisTile, { callback: this._runFromThisTile.bind(this) }),
      _.assign({}, FLOGO_TRANSFORM_SUB_EVENTS.saveTask, { callback: this._saveConfigFromTaskConfigurator.bind(this) }),
      _.assign({}, FLOGO_TASK_SUB_EVENTS.taskDetailsChanged, { callback: this._taskDetailsChanged.bind(this) }),
      _.assign({}, FLOGO_TASK_SUB_EVENTS.changeTileDetail, { callback: this._changeTileDetail.bind(this) }),
    ];

    _.each(
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
        flowDetails.selectItem((<DiagramActionSelf>diagramAction).id);
        return;
      }
      case DiagramActionType.Configure: {
        this._selectConfigureTaskFromDiagram((<DiagramActionSelf>diagramAction).id);
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

  private onSelectionChanged(selection: DiagramSelection) {
    if (!selection) {
      if (this.isTaskSubroute()) {
        this._navigateFromModuleRoot();
      }
    } else if (selection.type === DiagramSelectionType.Node) {
      this._selectTaskFromDiagram(selection.taskId);
    } else if (selection.type === DiagramSelectionType.Insert) {
      this._addTaskFromDiagram(selection.taskId);
    }
  }

  private isTaskSubroute() {
    const [firstRouteChild] = this._route.children;
    return firstRouteChild && firstRouteChild.routeConfig.path.startsWith('task/');
  }

  private onFlowStateUpdate(nextState: FlowState) {
    const prevState = this.flowState;
    this.flowState = nextState;
    this.determineRunnableEnabled();
    if (prevState && prevState.isErrorPanelOpen !== nextState.isErrorPanelOpen) {
      // todo: this shouldn't be necessary once we move away from route based state
      this._navigateFromModuleRoot();
    }
    this._flowService.saveFlowIfChanged(this.flowId, nextState)
      .subscribe(updated => {
        if (updated && !this._isCurrentProcessDirty) {
          this._isCurrentProcessDirty = true;
        }
        console.log('flowSaved?', updated);
      });
  }

  ngOnDestroy() {
    this.ngOnDestroy$.emitAndComplete();
    _.each(this._subscriptions, sub => {
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
    if (!selection || selection.type !== DiagramSelectionType.Node) {
      return;
    }
    const { taskId, diagramId } = selection;
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
    // TODO for performance pre-normalize and store task names?
    const newNormalizedName = normalizeTaskName(taskName);

    const allTasks = { ...this.flowState.mainItems, ...this.flowState.errorItems };

    // search for the greatest index in all the flow
    const greatestIndex = _.reduce(allTasks, (greatest: number, task: any) => {
      const currentNormalized = normalizeTaskName(task.name);
      let repeatIndex = 0;
      if (newNormalizedName === currentNormalized) {
        repeatIndex = 1;
      } else {
        const match = /^(.*)\-([0-9]+)$/.exec(currentNormalized); // some-name-{{integer}}
        if (match && match[1] === newNormalizedName) {
          repeatIndex = _.toInteger(match[2]);
        }
      }

      return repeatIndex > greatest ? repeatIndex : greatest;

    }, 0);

    return greatestIndex > 0 ? `${taskName} (${greatestIndex + 1})` : taskName;
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
        if (!_.isEmpty(results)) {
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
    const selection = currentState.currentSelection;
    const isAddingToRoot = selection && !selection.taskId;
    let diagramId: string;
    if (isAddingToRoot) {
      diagramId = selection.diagramId;
    } else {
      diagramId = this.getDiagramId(data.parentId);
    }

    let task = data.task;
    const taskName = this.uniqueTaskName(data.task.name);
    // generate task id when adding the task
    task = <Task> _.assign({},
      task,
      {
        id: this.profileService.generateTaskID(this._getAllTasks(), task),
        name: taskName
      });

    let item: ItemTask = {
      id: task.id,
      type: task.type,
      ref: task.ref,
      name: taskName,
      description: task.description,
      inputMappings: task.inputMappings,
      input: extractItemInputsFromTask(task),
      settings: task.settings,
    };

    const isSubFlowTask = isSubflowTask(data.task.type);
    if (isSubFlowTask) {
      item = {
        ...item,
        outputMappings: task.outputMappings,
      };
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
      parents: [currentState.currentSelection.taskId],
      features: {
        subflow: isSubFlowTask,
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

    const currentItem = <Item> _.cloneDeep(this.getTaskInHandler(handlerId, taskId));
    let currentTask;
    if (currentItem.type === FLOGO_TASK_TYPE.TASK_BRANCH) {
      currentTask = _.cloneDeep(currentItem);
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
      _.assign(
        {}, FLOGO_SELECT_TASKS_PUB_EVENTS.selectTask, {
          data: _.assign({},
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
      _.assign(
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
    if (<any>task.type === FLOGO_TASK_TYPE.TASK_ROOT) { // trigger
      // todo: used?
      this._triggerDetailsChanged(task, data, envelope);
      if (_.isFunction(envelope.done)) {
        envelope.done();
      }
      return;
    }

    const changes: { item: {id: string} & Partial<Item>, node: Partial<GraphNode> } = <any>{};
    if (task.type === FLOGO_TASK_TYPE.TASK) {
      const changedInputs = data.inputs || {};
      if (_.isEqual(changedInputs, task.input)) {
        return;
      }
      changes.item = {
        id: task.id,
        input: { ...changedInputs  }
      };
    } else if (task.type === FLOGO_TASK_TYPE.TASK_BRANCH) { // branch
      if (_.isEqual(data.condition, task.condition)) {
        return;
      }
      changes.item = {
        id: task.id,
        condition: data.condition,
      };
    }

    if (_.isFunction(envelope.done)) {
      envelope.done();
    }

    this.flowDetails.updateItem(
      this.handlerTypeFromString(handlerId),
      changes,
    );
  }

  private _triggerDetailsChanged(task: any, data: any, evnelope: any) {
    // todo: used?
    let updatePromise: any = Promise.resolve(true);

    if (data.changedStructure === 'settings') {
      updatePromise = this.triggersApiService.updateTrigger(this.currentTrigger.id, { settings: data.settings });
    } else if (data.changedStructure === 'endpointSettings' || data.changedStructure === 'outputs') {
      updatePromise = this._restAPIHandlerService.updateHandler(this.currentTrigger.id, this.flowState.id, {
        settings: data.endpointSettings,
        outputs: data.outputs
      });

    }

    updatePromise
      .then((res) => {
        this._updateAttributesChanges(task, data.settings, 'settings');
        this._updateAttributesChanges(task, data.endpointSettings, 'endpoint.settings');
        this._updateAttributesChanges(task, data.outputs, 'outputs');

        // ensure the persence of the internal properties
        task.__props = task.__props || {};

        // cache the outputs mock of a trigger, to be used as initial data when start/restart the flow.
        task.__props['outputs'] = _.map(_.get(task, 'outputs', []), (output: any) => {
          const newValue = data.outputs[output.name];

          // undefined is invalid default value, hence filter that out.
          if (output && !_.isUndefined(newValue)) {
            output.value = newValue;
          }

          return output;
        });
      });
  }

  private _updateAttributesChanges(task: any, changedInputs: any, structure: any) {
    const attributeNamePairs = _.get(task, structure, []).map(attr => <[string, any]>[attr.name, attr]);
    const attributesByName = new Map<string, any>(attributeNamePairs);
    Object.keys(changedInputs || {}).forEach(name => {
      const attribute = attributesByName.get(name);
      if (attribute) {
        attribute.value = changedInputs[name];
      }
    });
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
    }, _.noop); // TODO: remove when fixed https://github.com/ReactiveX/rxjs/issues/2180);

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

    const attrs = _.get(selectedTask, 'attributes.inputs');
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
        if (_.isFunction(envelope.done)) {
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
      return _.map(formAttrs, (input: any) => {
        // override the value;
        return _.assign(_.cloneDeep(input), {
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
      .subscribe(processStatus => this.logRunStatus(processStatus), _.noop);

    // TODO: only on run from trigger?
    runner.registered.subscribe(info => {
      this._isCurrentProcessDirty = false;
    }, _.noop); // TODO: remove when fixed https://github.com/ReactiveX/rxjs/issues/2180);

    runner.steps
      .subscribe(steps => {
        if (steps) {
          this.runState.steps = steps;
          this.updateTaskRunStatus(steps, {});
        }
      }, _.noop); // TODO: remove when fixed https://github.com/ReactiveX/rxjs/issues/2180

    return runner.completed
      .do(state => {
        this.runState.steps = state.steps;
        const message = this.translate.instant('CANVAS:SUCCESS-MESSAGE-COMPLETED');
        notification(message, 'success', 3000);
      })
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
    const flowInput = _.get(this.flowState, 'metadata.input');
    if (_.isEmpty(flowInput)) {
      return undefined;
    }
    // preprocessing initial data
    return _(flowInput)
      .filter((item: any) => {
        // filter empty values
        return !_.isNil(item.value);
      })
      .map((item: any) => _.cloneDeep(item))
      .value();
  }

  private determineRunnableEnabled() {
    this.runnableInfo = {
      disabled: _.isEmpty(this.flowState.mainItems),
      disableReason: null
    };
    if (this.runnableInfo.disabled) {
      return;
    }
    const allTasks = this._getAllTasks();
    const subflowOrIteratorTasks = Object.keys(allTasks).find(task => {
      return isSubflowTask(allTasks[task].type) || isIterableTask(allTasks[task]);
    });
    if (subflowOrIteratorTasks) {
      this.runnableInfo.disabled = true;
      this.runnableInfo.disableReason = this.translate.instant('CANVAS:WARNING-UNSUPPORTED-TEST-RUN');
    } else {
      this.runnableInfo.disabled = false;
      this.runnableInfo.disableReason = null;
    }
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
      if (_.isEmpty(node)) {
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
            executionErrored: !_.isUndefined(taskErrors) ? Object.values(taskErrors).map(err => err.msg) : null,
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

    _.set(rsp, '__status', {
      isFlowDone: isFlowDone,
      errors: errors,
      runTasks: runTasks,
      runTasksIDs: runTaskIds
    });

    this.flowDetails.executionStatusChanged(allStatusChanges);

    // when the flow is done on error, throw an error
    // the error is the response with `__status` provisioned.
    if (isFlowDone && !_.isEmpty(errors)) {
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
    const runTasks = _.reduce(steps, (result: any, step: any) => {
      const taskID = step.taskId;

      if (taskID !== 'root' && taskID !== 1 && !_.isNil(taskID)) {

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

        const taskInfo = _.reduce(_.get(step, 'flow.attributes', []),
          (currentTaskInfo: any, attr: any) => {
            if (reAttrName.test(_.get(attr, 'name', ''))) {
              currentTaskInfo[attr.name] = attr;
            }

            if (reAttrErrMsg.test(attr.name)) {
              let errs = <any[]>_.get(errors, `${taskID}`);
              const shouldOverride = _.isUndefined(errs);
              errs = errs || [];

              errs.push({
                msg: attr.value,
                time: new Date().toJSON()
              });

              if (shouldOverride) {
                _.set(errors, `${taskID}`, errs);
              }
            }
            return currentTaskInfo;
          }, {});

        result[taskID] = {attrs: taskInfo};
      } else if (_.isNull(taskID)) {
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
    const steps = _.get(this.runState.lastProcessInstanceFromBeginning, 'steps', this.runState.steps || []);

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
   |      Task Configurator        |
   *-------------------------------*/

  private _selectConfigureTaskFromDiagram(itemId: string) {
    const diagramId = this.getDiagramId(itemId);
    const flowState = this.flowState;
    let scope: any[];

    if (diagramId === HandlerType.Error) {
      const allPathsMainFlow = this.getAllPaths(flowState.mainGraph.nodes);
      const previousTilesMainFlow = this.mapNodesToTiles(
        allPathsMainFlow,
        { nodes: flowState.mainGraph.nodes, items: flowState.mainItems }
      );
      const previousNodesErrorFlow = this.findPathToNode(flowState.errorGraph.rootId, itemId, flowState.errorGraph.nodes);
      previousNodesErrorFlow.pop(); // ignore last item as it is the very same selected node
      const previousTilesErrorFlow = this.mapNodesToTiles(
        previousNodesErrorFlow,
        { nodes: flowState.errorGraph.nodes, items: flowState.errorItems  }
      );
      scope = [...previousTilesMainFlow, makeErrorTask(), ...previousTilesErrorFlow];
    } else {
      const previousNodes = this.findPathToNode(flowState.mainGraph.rootId, itemId, flowState.mainGraph.nodes);
      previousNodes.pop(); // ignore last item as it is the very same selected node
      scope = this.mapNodesToTiles(previousNodes, { nodes: flowState.mainGraph.nodes, items: flowState.mainItems });
    }

    const metadata = <FlowMetadata>  _.defaultsDeep({
      type: 'metadata',
    }, this.flowState.metadata, { input: [], output: [] });
    scope.push(metadata);

    const selectedItem = <ItemTask>_.cloneDeep(this.findItemById(itemId));
    const activitySchema: PartialActivitySchema = this.flowState.schemas[selectedItem.ref] || {};
    const task = mergeItemWithSchema(selectedItem, activitySchema);
    const outputMapper = isMapperActivity(activitySchema);

    let overridePropsToMap = null;
    let overrideMappings = null;
    let inputMappingsTabLabelKey = null;
    let searchTitleKey;
    let transformTitle;

    if (outputMapper) {
      overridePropsToMap = metadata.output;
      const inputs = selectedItem.input || {};
      overrideMappings = inputs.mappings || [];
      transformTitle = this.translate.instant('TASK-CONFIGURATOR:TITLE-OUTPUT-MAPPER', { taskName: selectedItem.name });
      searchTitleKey = 'TASK-CONFIGURATOR:FLOW-OUTPUTS';
      inputMappingsTabLabelKey = 'TASK-CONFIGURATOR:FLOW-OUTPUTS';
    }

    const taskSettings = selectedItem.settings;
    const iterator = (<ItemActivityTask>selectedItem).return ? null : {
      isIterable: isIterableTask(selectedItem),
      iterableValue: taskSettings && taskSettings.iterate ? taskSettings.iterate : null,
    };
    const dataToPublish = _.assign(
      {}, FLOGO_TRANSFORM_PUB_EVENTS.selectTask, {
        data: <SelectTaskConfigEventData>{
          scope,
          overridePropsToMap,
          overrideMappings,
          inputMappingsTabLabelKey,
          tile: task,
          handlerId: diagramId,
          title: transformTitle,
          inputsSearchPlaceholderKey: searchTitleKey,
          iterator: iterator
        }
      }
    );
    if (isSubflowItem(selectedItem)) {
      const subflowSchema = this.flowDetails.getSubflowSchema(selectedItem.settings.flowPath);
      if (subflowSchema) {
        dataToPublish.data.subflowSchema = subflowSchema;
        dataToPublish.data.appId = this.flowState.appId;
        dataToPublish.data.actionId = this.flowState.id;
      } else {
        return this.translate.get('SUBFLOW:REFERENCE-ERROR-TEXT')
          .subscribe(message => notification(message, 'error'));
      }
    }
    this._postService.publish(dataToPublish);

  }

  private _saveConfigFromTaskConfigurator(data: SaveTaskConfigEventData, envelope: any) {
    const diagramId = data.handlerId;
    const tile = <ItemTask> this.getTaskInHandler(diagramId, data.tile.id);
    const changedSubflowSchema = data.changedSubflowSchema;
    const tileAsSubflow = <ItemSubflow> tile;
    const itemChanges: {id: string} & Partial<ItemActivityTask & ItemSubflow> = {
      id: tile.id,
      settings: tile.settings,
    };
    if (changedSubflowSchema && tileAsSubflow.settings.flowPath !== data.tile.settings.flowPath) {
      this.manageFlowRelationships(tileAsSubflow.settings.flowPath);
      itemChanges.name = this.uniqueTaskName(changedSubflowSchema.name);
      itemChanges.description = changedSubflowSchema.description;
      itemChanges.settings = {
        ...itemChanges.settings,
        flowPath: changedSubflowSchema.id,
      };
      this.flowDetails.addSubflowSchema(changedSubflowSchema);
    }
    const activitySchema = this.flowState.schemas[tile.ref];
    const isMapperTask = isMapperActivity(activitySchema);
    if (isMapperTask) {
      itemChanges.input = {
        mappings: _.cloneDeep(data.inputMappings),
      };
    } else {
      itemChanges.inputMappings = _.cloneDeep(data.inputMappings);
    }

    // tile.type = <any>data.tile.type;
    const iteratorInfo = data.iterator;
    itemChanges.settings = {
      ...itemChanges.settings,
      iterate: iteratorInfo.isIterable ? data.iterator.iterableValue : undefined,
    };

    this.flowDetails.updateItem(this.handlerTypeFromString(diagramId), { item: itemChanges });

    this.determineRunnableEnabled();
    // context potentially changed
    this.refreshCurrentTileContextIfNeeded();
  }

  private getAllPaths(nodes: any) {
    return Object.keys(nodes);
  }

  /**
   * Finds a path from starting node to target node
   * Assumes we have a tree structure, meaning we have no cycles
   * @param {string} startNodeId
   * @param {string} targetNodeId
   * @param {Dictionary<GraphNode>} nodes
   * @returns string[] list of node ids
   */
  private findPathToNode(startNodeId: any, targetNodeId: any, nodes: Dictionary<GraphNode>) {
    let queue = [[startNodeId]];

    while (queue.length > 0) {
      const path = queue.shift();
      const nodeId = path[path.length - 1];

      if (nodeId === targetNodeId) {
        return path;
      }

      const children = nodes[nodeId].children;
      if (children) {
        const paths = children.map(child => path.concat(child));
        queue = queue.concat(paths);
      }
    }
    return [];
  }

  private mapNodesToTiles(nodeIds: any[], from: { nodes: Dictionary<GraphNode>, items: Dictionary<Item> }) {
    const canUseItemOutputs = (node: GraphNode) => node.type === NodeType.Task;
    return nodeIds
      .map(nodeId => {
        const node = from.nodes[nodeId];
        if (canUseItemOutputs(node)) {
          const item = <ItemTask> from.items[nodeId];
          let schema: PartialActivitySchema = this.flowState.schemas[item.ref];
          if (isSubflowItem(item)) {
            const subFlowSchema = this.flowDetails.getSubflowSchema(item.settings.flowPath);
            schema = { outputs: _.get(subFlowSchema, 'metadata.output', []) };
          }
          return mergeItemWithSchema(item, schema);
        } else {
          return null;
        }
      })
      .filter(task => !!task);
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
    if (!currentSelection || currentSelection.type !== DiagramSelectionType.Node) {
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
      const actionInputMappings = _.get(handler, 'actionMappings.input', []);
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
    _.filter(this._getAllTasks(), isMapperContribAndHasMapping)
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
    return !!_.values(this._getAllTasks()).find((t: ItemSubflow) => t.settings && t.settings.flowPath === id);
  }

}
