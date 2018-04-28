import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';

import {
  MetadataAttribute, Task, LanguageService, ItemTask, Item, ItemSubflow, Dictionary, GraphNode, ItemActivityTask, NodeType
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
  SUB_EVENTS as FLOGO_DIAGRAM_PUB_EVENTS
} from './shared/diagram/messages';
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
import {
  PUB_EVENTS as FLOGO_ERROR_PANEL_SUB_EVENTS,
  SUB_EVENTS as FLOGO_ERROR_PANEL_PUB_EVENTS
} from './error-panel/messages';

import { AppsApiService } from '../core/services/restapi/v2/apps-api.service';
import { RESTAPIHandlersService } from '../core/services/restapi/v2/handlers-api.service';
import {
  FLOGO_FLOW_DIAGRAM_NODE_TYPE,
  FLOGO_PROFILE_TYPE,
  FLOGO_TASK_TYPE
} from '../core/constants';
import {
  flogoGenBranchID,
  isIterableTask,
  isMapperActivity,
  isSubflowTask,
  normalizeTaskName,
  notification,
  objectFromArray
} from '@flogo/shared/utils';

import { HandlerInfo } from '@flogo/core';

import { FlogoFlowService as FlowsService } from './core/flow.service';
import { IFlogoTrigger } from './triggers/models';
import { ParamsSchemaComponent } from './params-schema/params-schema.component';
import { updateBranchNodesRunStatus } from './shared/diagram/utils';
import { SaveTaskConfigEventData } from './task-configurator';
import { makeDefaultErrorTrigger } from '@flogo/flow/shared/diagram/models/task.model';
import { mergeItemWithSchema, extractItemInputsFromTask, PartialActivitySchema } from '@flogo/core/models';
import { DiagramSelection, DiagramAction, DiagramActionType } from '@flogo/packages/diagram';
import { DiagramActionChild, DiagramActionSelf, DiagramSelectionType } from '@flogo/packages/diagram/interfaces';
import { HandlerType } from '@flogo/flow/core/models';
import { FlowState } from '@flogo/flow/core/models/flow-state';
import { makeNode } from '@flogo/flow/core/models/graph-and-items/graph-creator';

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

const FLOW_HANDLER_TYPE_ROOT = 'root';
const FLOW_HANDLER_TYPE_ERROR = 'errorHandler';
const isSubflowItem = (item: Item): item is ItemSubflow => isSubflowTask(item.type);

@Component({
  selector: 'flogo-flow',
  templateUrl: 'flow.component.html',
  styleUrls: ['flow.component.less']
})

export class FlowComponent implements OnInit, OnDestroy {
  @ViewChild('inputSchemaModal') defineInputSchema: ParamsSchemaComponent;
  public flowState: FlowState;
  public triggersList: IFlogoTrigger[];
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

  public loading: boolean;
  public hasTrigger: boolean;
  public hasTask: boolean;
  public currentTrigger: any;
  public app: any;

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
    this.hasTask = true;
    this.currentTrigger = null;
    this.app = null;
  }

  get flowId() {
    return this._flowService.currentFlowDetails.id;
  }

  public ngOnInit() {
    const flowData: FlowData = this._route.snapshot.data['flowData'];
    const flowDetails = this._flowService.currentFlowDetails;
    flowDetails.flow$
      .subscribe(flowState => {
        console.log(flowState);
        this.flowState = flowState;
      });
    this.initFlowData(flowData);
    flowDetails.selectionChange$.subscribe(selection => this.onSelectionChanged(selection));
    this.initSubscribe();
    this.loading = false;
  }

  private initSubscribe() {
    this._subscriptions = [];

    const subs = [
      _.assign({}, FLOGO_ADD_TASKS_SUB_EVENTS.addTask, { callback: this._addTaskFromTasks.bind(this) }),
      _.assign({}, FLOGO_TASK_SUB_EVENTS.runFromThisTile, { callback: this._runFromThisTile.bind(this) }),
      _.assign({}, FLOGO_TASK_SUB_EVENTS.setTaskWarnings, { callback: this._setTaskWarnings.bind(this) }),
      _.assign({}, FLOGO_TRANSFORM_SUB_EVENTS.saveTask, { callback: this._saveConfigFromTaskConfigurator.bind(this) }),
      _.assign({}, FLOGO_TASK_SUB_EVENTS.taskDetailsChanged, { callback: this._taskDetailsChanged.bind(this) }),
      _.assign({}, FLOGO_TASK_SUB_EVENTS.changeTileDetail, { callback: this._changeTileDetail.bind(this) }),
      _.assign({}, FLOGO_ERROR_PANEL_SUB_EVENTS.openPanel, { callback: this._errorPanelStatusChanged.bind(this, true) }),
      _.assign({}, FLOGO_ERROR_PANEL_SUB_EVENTS.closePanel, { callback: this._errorPanelStatusChanged.bind(this, false) })
    ];

    _.each(
      subs, sub => {
        this._subscriptions.push(this._postService.subscribe(sub));
      }
    );
  }

  private onMainDiagramAction(diagramAction: DiagramAction) {
    this.onDiagramAction(HandlerType.Main, diagramAction);
  }

  private onErrorDiagramAction(diagramAction: DiagramAction) {
    this.onDiagramAction(HandlerType.Error, diagramAction);
  }

  private onDiagramAction(handlerType: HandlerType, diagramAction: DiagramAction) {
    const flowDetails = this._flowService.currentFlowDetails;
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
        flowDetails.selectInsert((<DiagramActionChild>diagramAction).parentId);
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
      const [firstRouteChild] = this._route.children;
      if (firstRouteChild && firstRouteChild.routeConfig.path.startsWith('task/')) {
        this._navigateFromModuleRoot();
      }
    } else if (selection.type === DiagramSelectionType.Node) {
      this._selectTaskFromDiagram(selection.taskId);
    } else if (selection.type === DiagramSelectionType.Insert) {
      this._addTaskFromDiagram(selection.taskId);
    }
  }

  ngOnDestroy() {
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
    const taskInfo = this.getCurrentTaskInfoFromRoute();
    if (!taskInfo) {
      return;
    }
    const { taskId, diagramId } = taskInfo;
    const context = this._getCurrentTaskContext(taskId, diagramId);
    this._postService.publish(Object.assign(
      {},
      FLOGO_SELECT_TASKS_PUB_EVENTS.taskContextUpdated,
      { data: { taskId, context } }
      ));
  }

  private getCurrentTaskInfoFromRoute() {
    const rootSnapshot = this._router.routerState.snapshot.root;
    const thisRoute = rootSnapshot.firstChild;
    if (!thisRoute && thisRoute.url[0].path !== 'flows') {
      // not on this route
      return null;
    }
    const childRoute = thisRoute.firstChild;
    if (!childRoute) {
      return null;
    }
    const [taskSegment, taskIdSegment] = childRoute.url;
    if (!taskSegment || taskSegment.path !== 'task') {
      return null;
    }
    const taskId = taskIdSegment.path;
    let diagramId;
    if (this.flowState.mainItems[taskId]) {
      diagramId = FLOW_HANDLER_TYPE_ROOT;
    } else if (this.flowState.errorItems[taskId]) {
      diagramId = FLOW_HANDLER_TYPE_ERROR;
    } else {
      return null;
    }
    return { diagramId, taskId };
  }

  public _updateFlow(flow: any) {
    return Promise.resolve(flow);
    // this._isCurrentProcessDirty = true;
    //
    // function cleanPaths(paths: any) {
    //   _.each(_.keys(paths), key => {
    //     if (key !== 'root' && key !== 'nodes') {
    //       delete paths[key];
    //     }
    //   });
    // }
    //
    // // processing this._flow to pure JSON object
    // flow = _.cloneDeep(flow);
    // cleanPaths(flow.paths);
    //
    // if (flow.errorHandler && !_.isEmpty(flow.errorHandler.paths)) {
    //   cleanPaths(flow.errorHandler.paths);
    // }
    //
    // this.determineRunnableEnabled();
    // return this._flowService.saveFlow(this.flowId, flow).then(rsp => {
    //   if (_.isEmpty(flow.items)) {
    //     this.hasTask = false;
    //   }
    //   console.groupCollapsed('Flow updated');
    //   console.log(rsp);
    //   console.groupEnd();
    //   return rsp;
    // });
  }

  private initFlowData(flowData: FlowData) {
    this.flowName = flowData.flow.name;
    if (_.isEmpty(flowData.flow.mainItems)) {
      this.hasTask = false;
    }
    this.triggersList = flowData.triggers;

    this.clearAllHandlersRunStatus();
    this.determineRunnableEnabled();
    // todo: move to resolver?
    this.profileService.initializeProfile(flowData.flow.app);
    this.profileType = this.profileService.currentApplicationProfile;
  }

  private _getCurrentState(taskID: string) {
    const steps = this.runState.steps || [];
    // allow double equal check for legacy ids that were type number
    /* tslint:disable-next-line:triple-equals */
    return steps.find(step => taskID == step.taskId);
  }

  private _errorPanelStatusChanged(isOpened: boolean, data: any, envelope: any) {
    console.group('Close/open error panel from error panel');
    // this._cleanSelectionStatus();
    this._navigateFromModuleRoot();
    console.groupEnd();
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

  private _getCurrentTaskContext(taskId: any, diagramId: string): TaskContext {
    const taskType = this.getTaskInHandler(diagramId, taskId).type;
    return {
      isTrigger: false, // taskType === FLOGO_TASK_TYPE.TASK_ROOT,
      isBranch: taskType === FLOGO_TASK_TYPE.TASK_BRANCH,
      isTask: taskType === FLOGO_TASK_TYPE.TASK || taskType === FLOGO_TASK_TYPE.TASK_SUB_PROC,
      shouldSkipTaskConfigure: this.isTaskSubflowOrMapper(taskId, diagramId),
      flowRunDisabled: this.runnableInfo && this.runnableInfo.disabled,
      hasProcess: Boolean(this.runState.currentProcessId),
      isDiagramEdited: this._isDiagramEdited,
      app: null,
      currentTrigger: null,
      profileType: this.profileType
    };
  }

  private getItemsByHandlerId(id: string) {
    return id === FLOW_HANDLER_TYPE_ROOT ? this.flowState.mainItems : this.flowState.errorItems;
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
    return new Promise((resolve, reject) => {
      this._updateFlow(this.flowState).then((response: any) => {
        const message = this.translate.instant('CANVAS:SUCCESS-MESSAGE-UPDATE', { value: property });
        notification(message, 'success', 3000);
        resolve(response);
      }).catch((err) => {
        const message = this.translate.instant('CANVAS:ERROR-MESSAGE-UPDATE', { value: property });
        notification(message, 'error');
        reject(err);
      });
    });

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
          this._updateFlow(this.flowState).then((response: any) => {
            const message = this.translate.instant('CANVAS:SUCCESS-MESSAGE-UPDATE', { value: property });
            this.flowName = this.flowState.name;
            notification(message, 'success', 3000);
            return response;
          }).catch((err) => {
            const message = this.translate.instant('CANVAS:ERROR-MESSAGE-UPDATE', { value: property });
            notification(message, 'error');
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
    const diagramId: string = this.getDiagramId(data.parentId);
    const currentState = this.flowState;

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

    this._flowService.currentFlowDetails.registerNewItem(
      diagramId === FLOW_HANDLER_TYPE_ROOT ? HandlerType.Main : HandlerType.Error,
      { item, node, schema },
    );

    // this._navigateFromModuleRoot()
    //   .then(
    //     () => {
    //       this._postService.publish(
    //         _.assign(
    //           {}, FLOGO_DIAGRAM_PUB_EVENTS.addTask, {
    //             data: {
    //               node: data.node,
    //               task: task,
    //               id: data.id
    //             },
    //             // todo: remove, this is a temporal solution to prevent auto opening a new tile
    //             skipTaskAutoSelection: isMapperTask || isSubFlowTask,
    //             done: (diagram: FlowDiagram) => {
    //               _.assign(this.handlers[diagramId].diagram, diagram);
    //               this._updateFlow(this.flow);
    //               this._isDiagramEdited = true;
    //               this.hasTask = true;
    //               if (isMapperTask || isSubFlowTask) {
    //                 // todo: remove, this is a temporal solution to clear the diagram selection state
    //                 this._cleanSelectionStatus();
    //               }
    //             }
    //           }
    //         )
    //       );
    //     }
    //   );
    // console.groupEnd();

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
    const context = this._getCurrentTaskContext(taskId, handlerId);

    const currentItem = <ItemTask> _.cloneDeep(this.getTaskInHandler(handlerId, taskId));
    // schema == {} for subflow case
    const activitySchema = this.flowState.schemas[currentItem.ref] || <any>{};
    const currentTask = mergeItemWithSchema(currentItem, activitySchema);

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
    if (data.proper === 'name') {
      task[data.proper] = this.uniqueTaskName(data.content);
    } else {
      task[data.proper] = data.content;
    }

    const updateObject = {};
    const propsToUpdateFormBuilder: IPropsToUpdateFormBuilder = <IPropsToUpdateFormBuilder> {};
    propsToUpdateFormBuilder.name = task.name;

    this._updateFlow(this.flowState).then(() => {
      this._postService.publish(
        _.assign(
          {}, FLOGO_TASK_PUB_EVENTS.updatePropertiesToFormBuilder, {
            data: propsToUpdateFormBuilder
          }
        )
      );
    });

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
        this._flowService.currentFlowDetails.removeItem(handlerType, taskId);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  private _taskDetailsChanged(data: any, envelope: any) {
    const handlerId = this.getDiagramId(data.id);
    const task = this.getTaskInHandler(handlerId, data.taskId);
    if (<any>task.type === FLOGO_TASK_TYPE.TASK_ROOT) { // trigger
      // todo: used?
      this._triggerDetailsChanged(task, data, envelope);
      if (_.isFunction(envelope.done)) {
        envelope.done();
      }
      return;
    }

    let changes: Partial<Item>;
    if (task.type === FLOGO_TASK_TYPE.TASK) {
      const changedInputs = data.inputs || {};
      // set/unset the warnings in the tile
      changes = {
        id: task.id,
        __props: {
          ...task.__props,
          warnings: data.warnings,
        },
        input: { ...changedInputs  }
      };
    } else if (task.type === FLOGO_TASK_TYPE.TASK_BRANCH) { // branch
      changes = {
        id: task.id,
        condition: data.condition,
      };
    }

    if (_.isFunction(envelope.done)) {
      envelope.done();
    }

    this._flowService.currentFlowDetails.updateItem(
      handlerId === FLOW_HANDLER_TYPE_ROOT ? HandlerType.Main : HandlerType.Error,
      { item: changes },
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

  private _setTaskWarnings(data: any, envelope: any) {
    const handlerId = this.getDiagramId(data.taskId);
    const task = this.getTaskInHandler(handlerId, data.taskId);

    if (task) {
      this._flowService.currentFlowDetails.updateItem(
        handlerId === FLOW_HANDLER_TYPE_ROOT ? HandlerType.Main : HandlerType.Error,
        {
          item: {
            __props: {
              ...task.__props,
              warnings: data.warnings,
            }
          },
        }
      );
    }

  }

  private _getAllTasks() {
    return {...this.flowState.mainItems, ...this.flowState.errorItems};
  }

  /*-------------------------------*
   |      RUN FLOW                 |
   *-------------------------------*/

  private _runFromRoot() {
    this._postService.publish(FLOGO_ERROR_PANEL_PUB_EVENTS.closePanel);

    this._isDiagramEdited = false;
    this.cleanDiagramRunState();
    this.markRootAsRan();

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
    // this._postService.publish(FLOGO_DIAGRAM_PUB_EVENTS.render);

    const runner = this._runnerService.rerun({
      useFlow: this.flowState,
      interceptor: dataOfInterceptor,
      step: step,
      instanceId: this.runState.processInstanceId,
    });

    this.observeRunProgress(runner)
      .then(() => {
        const currentStep = this._getCurrentState(data.taskId);
        const currentTask = _.assign({}, _.cloneDeep(this.flowState.mainItems[data.taskId]));
        const context = this._getCurrentTaskContext(data.taskId, 'root');

        this._postService.publish(_.assign({},
          FLOGO_SELECT_TASKS_PUB_EVENTS.selectTask,
          { data: _.assign({}, data, { context, task: currentTask, step: currentStep, }) })
        );

        if (_.isFunction(envelope.done)) {
          envelope.done();
        }

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

  private markRootAsRan() {
    try { // rootTask should be in DONE status once the flow start
      // todo: should send update instead
      const rootTask = this.flowState.mainItems[this.flowState.mainGraph.rootId];
      rootTask.__status['hasRun'] = true;
      rootTask.__status['isRunning'] = false;
    } catch (e) {
      console.warn(e);
      console.warn('No root task/trigger is found.');
    }
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
    // Object.keys(this.handlers).forEach(handlerId => {
    //   const tasks = this.handlers[handlerId].tasks;
    //   if (_.isEmpty(tasks)) {
    //     return;
    //   }
    //   _.forIn(tasks, (task: any, taskID: string) => {
    //     // clear errors
    //     task.__props = task.__props || {};
    //     task.__props.errors = [];
    //
    //     // ensure the presence of __status
    //     task.__status = task.__status || {};
    //     task.__status.isRunning = false;
    //     task.__status.hasRun = false;
    //
    //   });
    // });
  }

  private updateTaskRunStatus(steps: Step[], rsp: any) {
    let isErrorHandlerTouched = false;
    const runTasksIDs = <string[]>[];
    const errors = <{
      [index: string]: {
        msg: string;
        time: string;
      }[];
    }>{};
    let isFlowDone = false;
    const runTasks = _.reduce(steps, (result: any, step: any) => {
      const taskID = step.taskId;

      if (taskID !== 'root' && taskID !== 1 && !_.isNil(taskID)) { // if not rootTask and not `null`

        /****
         *  Exclude the tasks which are skipped by the engine while running the flow
         *  but their running task information is generated and maintained
         ****/
        const taskState = step.taskState || 0;
        if (taskState !== RUNNER_STATE.Skipped) {
          runTasksIDs.push(taskID);
        }
        const reAttrName = new RegExp(`^_A.${step.taskId}\\..*`, 'g');
        const reAttrErrMsg = new RegExp(`^\{Error.message}`, 'g');

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

        result[taskID] = { attrs: taskInfo };
      } else if (_.isNull(taskID)) {
        isFlowDone = true;
      }

      return result;
    }, {});

    _.each(
      runTasksIDs, (runTaskID: string) => {
        let task = this.flowState.mainItems[runTaskID];

        if (_.isEmpty(task)) {
          task = this.flowState.errorItems[runTaskID];
          isErrorHandlerTouched = !!task;
        }

        if (task) {
          // todo: should send update instead
          task.__status.hasRun = true;
          task.__status.isRunning = false;

          const errs = errors[runTaskID];
          if (!_.isUndefined(errs)) {
            _.set(task, '__props.errors', errs);
          }
        }
      }
    );

    _.set(rsp, '__status', {
      isFlowDone: isFlowDone,
      errors: errors,
      runTasks: runTasks,
      runTasksIDs: runTasksIDs
    });


    // todo: re-enable
    // const flowState = this.flowState;
    // updateBranchNodesRunStatus(flowState.mainGraph.nodes, flowState.mainItems);
    // updateBranchNodesRunStatus(flowState.errorGraph.nodes, flowState.errorItems);

    if (isErrorHandlerTouched) {
      this._postService.publish(FLOGO_ERROR_PANEL_PUB_EVENTS.openPanel);
    }

    // this._postService.publish(FLOGO_DIAGRAM_PUB_EVENTS.render);

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

    if (diagramId === FLOW_HANDLER_TYPE_ERROR) {
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
      scope = [...previousTilesMainFlow, makeDefaultErrorTrigger(), ...previousTilesErrorFlow];
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
          iterator: {
            isIterable: isIterableTask(selectedItem),
            iterableValue: taskSettings && taskSettings.iterate ? taskSettings.iterate : null,
          },
        }
      }
    );
    if (isSubflowItem(selectedItem)) {
      const subflowSchema = this._flowService.currentFlowDetails.getSubflowSchema(selectedItem.settings.flowPath);
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
    const itemChanges: Partial<ItemActivityTask & ItemSubflow> = {
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
      this._flowService.currentFlowDetails.addSubflowSchema(changedSubflowSchema);
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

    this._flowService.currentFlowDetails.updateItem(
      diagramId === FLOW_HANDLER_TYPE_ROOT ? HandlerType.Main : HandlerType.Error,
      { item: itemChanges },
    );

    this.determineRunnableEnabled();
    // context potentially changed
    this.refreshCurrentTileContextIfNeeded();
    // this._updateFlow(this.flowState).then(() => {
    //   // this._postService.publish(FLOGO_DIAGRAM_PUB_EVENTS.render);
    // });
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
    const isApplicableNodeType = _.includes.bind(null, [
      FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE,
      FLOGO_FLOW_DIAGRAM_NODE_TYPE.NODE_ROOT,
    ]);

    return nodeIds
      .map(nodeId => {
        const node = from.nodes[nodeId];
        if (isApplicableNodeType(node.type)) {
          const item = <ItemTask> from.items[nodeId];
          let schema: PartialActivitySchema = this.flowState.schemas[item.ref];
          if (isSubflowItem(item)) {
            const subFlowSchema = this._flowService.currentFlowDetails.getSubflowSchema(item.settings.flowPath);
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
      flowUpdatePromise = this._updateFlow(this.flowState);
    } else {
      flowUpdatePromise = Promise.resolve(this.flowState);
    }
    flowUpdatePromise.then(() => this._runFromRoot())
      .then(() => {
        const parsedURL = location.pathname.split('task/');
        if (parsedURL.length === 2 && _.isString(parsedURL[1])) {
          const taskId = parsedURL[1];
          const id = this.getDiagramId(taskId);
          if (id) {
            this._updateTaskOutputAfterRun({ id, taskId });
          }
        }
      });
  }

  private getDiagramId(taskId: string): string {
    if (this.getTaskInHandler(FLOW_HANDLER_TYPE_ROOT, taskId)) {
      return FLOW_HANDLER_TYPE_ROOT;
    } else if (this.getTaskInHandler(FLOW_HANDLER_TYPE_ERROR, taskId)) {
      return FLOW_HANDLER_TYPE_ERROR;
    }
    // todo: throw error?
    return null;
  }

  private _updateTaskOutputAfterRun(data: {
    id: string,
    taskId: string
  }) {
    const diagramId: string = data.id;
    const step = this._getCurrentState(data.taskId);
    const task = _.cloneDeep(this.getTaskInHandler(diagramId, data.taskId));
    const context = this._getCurrentTaskContext(data.taskId, diagramId);

    this._postService.publish(
      _.assign(
        {}, FLOGO_SELECT_TASKS_PUB_EVENTS.selectTask, {
          data: _.assign({},
            data,
            { task, step, context }
          )
        }
      ));
  }

  public onFlowSchemaSave(newMetadata: FlowMetadata) {
    this.flowState.metadata.input = this.mergeFlowInputMetadata(newMetadata.input);
    this.flowState.metadata.output = newMetadata.output;

    const propCollectionToRegistry = (from) => new Map(<Array<[string, boolean]>>from.map((o: any) => [o.name, true]));

    const outputRegistry = propCollectionToRegistry(newMetadata.output);
    const inputRegistry = propCollectionToRegistry(newMetadata.input);
    this.cleanDanglingTaskOutputMappings(outputRegistry);

    this.cleanDanglingTriggerMappingsToFlow(inputRegistry);
    this._updateFlow(this.flowState);
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
      return !!(isMapperActivity(schema) && task.attributes.inputs.length);
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
      this._flowService.currentFlowDetails.deleteSubflowSchema(flowId);
    }
  }

  private isFlowUsedAgain(id: string) {
    return !!_.values(this._getAllTasks()).find((t: ItemSubflow) => t.settings && t.settings.flowPath === id);
  }

}
