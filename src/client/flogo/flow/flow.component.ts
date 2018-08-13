import {
  assign,
  cloneDeep,
  each,
  filter,
  get,
  isEmpty,
  isEqual,
  isFunction,
} from 'lodash';
import { share, takeUntil, take, switchMap } from 'rxjs/operators';
import { Component, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MetadataAttribute,
  Task,
  LanguageService,
  ItemTask,
  Item,
  GraphNode,
} from '@flogo/core';
import { TriggersApiService } from '@flogo/core/services';
import { PostService } from '@flogo/core/services/post.service';
import { FlogoProfileService } from '@flogo/core/services/profile.service';

import { Step } from './core/test-runner/run-orchestrator.service';
import { FlowData } from './core';

import { FlowMetadata } from './task-configurator/models/flow-metadata';
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
  getProfileType, isMapperActivity, isSubflowTask, notification,
} from '@flogo/shared/utils';

import { FlogoFlowService as FlowsService } from './core/flow.service';
import { ParamsSchemaComponent } from './params-schema/params-schema.component';
import { mergeItemWithSchema } from '@flogo/core/models';
import { HandlerType, CurrentSelection, SelectionType } from './core/models';
import { FlowState } from './core/state';


import { SingleEmissionSubject } from '@flogo/core/models';
import { Trigger } from './core';
import { uniqueTaskName } from '@flogo/flow/core/models/unique-task-name';
import { TestRunnerService } from '@flogo/flow/core/test-runner/test-runner.service';
import {ConfirmationResult} from '@flogo/core';
import {ConfirmationModalService} from '@flogo/core/confirmation/confirmation-modal/confirmation-modal.service';


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

@Component({
  selector: 'flogo-flow',
  providers: [TestRunnerService],
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

  _subscriptions: any[];
  _id: any;

  _isDiagramEdited: boolean;
  flowName: string;
  backToAppHover = false;

  profileType: FLOGO_PROFILE_TYPE;
  PROFILE_TYPES: typeof FLOGO_PROFILE_TYPE = FLOGO_PROFILE_TYPE;

  @HostBinding('hidden') loading: boolean;
  public hasTrigger: boolean;
  public currentTrigger: any;
  public app: any;
  public isflowMenuOpen = false;

  private ngOnDestroy$ = SingleEmissionSubject.create();

  constructor(public translate: LanguageService,
              private _postService: PostService,
              private _flowService: FlowsService,
              private triggersApiService: TriggersApiService,
              private _restAPIHandlerService: RESTAPIHandlersService,
              private _restAPIAppsService: AppsApiService,
              private _router: Router,
              private confirmationModalService: ConfirmationModalService,
              private profileService: FlogoProfileService,
              private _route: ActivatedRoute,
              private testRunner: TestRunnerService) {
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
    // TODO: fcastill - remove after getting rid of right rail
    this.flowDetails.itemsChange$
      .pipe(
        takeUntil(this.ngOnDestroy$),
        switchMap(() => this.flowDetails.flowState$.pipe(take(1))),
      )
      .subscribe(() => this.refreshCurrentTileContextIfNeeded);
    this.initSubscribe();
    this.loading = false;
  }

  toggleFlowMenu() {
    this.isflowMenuOpen = !this.isflowMenuOpen;
  }

  closeFlowMenu() {
    this.isflowMenuOpen = false;
  }

  private initSubscribe() {
    this._subscriptions = [];

    const subs = [
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

  private get flowDetails() {
    return this._flowService.currentFlowDetails;
  }

  private onSelectionChanged(selection: CurrentSelection) {
    if (!selection) {
      if (this.isTaskSubroute()) {
        this._navigateFromModuleRoot();
      }
    } else if (selection.type === SelectionType.Task) {
      this._selectTaskFromDiagram(selection.taskId);
    } else if (selection.type === SelectionType.InsertTask) {
      this._navigateFromModuleRoot();
      // this._addTaskFromDiagram(selection.parentId);
    }
  }

  private isTaskSubroute() {
    const [firstRouteChild] = this._route.children;
    return firstRouteChild && firstRouteChild.routeConfig.path.startsWith('task/');
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
    this.closeFlowMenu();
    this.translate.get(['FLOWS:CONFIRM_DELETE', 'MODAL:CONFIRM-DELETION'], {flowName: this.flowState.name}).pipe(
      switchMap(translation => {
        return this.confirmationModalService.openModal({
          title: translation['MODAL:CONFIRM-DELETION'],
          textMessage: translation['FLOWS:CONFIRM_DELETE']
        }).result;
      })
    ).subscribe(result => {
      if (result === ConfirmationResult.Confirm) {
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
              .subscribe(message => notification(message, 'error'));
          });
      }
    });
  }

  onDeleteTask(taskDetails) {
    this._deleteTaskFromDiagram(taskDetails.handlerType, taskDetails.itemId);
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
    this.profileType = getProfileType(flowData.flow.app);
  }

  private getCurrentRunStateForTask(taskID: string) {
    const steps = this.testRunner.getCurrentRunState().steps || [];
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
      hasProcess: Boolean(this.flowState.lastFullExecution.processId),
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
    const currentStep = this.getCurrentRunStateForTask(taskId);
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
    this.translate.get(['FLOW:CONFIRM-TASK-DELETE', 'MODAL:CONFIRM-DELETION']).pipe(
      switchMap(translation => {
        return this.confirmationModalService.openModal({
          title: translation['MODAL:CONFIRM-DELETION'],
          textMessage: translation['FLOW:CONFIRM-TASK-DELETE']
        }).result;
      })
    ).subscribe(result => {
      if (!result) {
        return;
      }
      if (result === ConfirmationResult.Confirm) {
        this._isDiagramEdited = true;
        this.flowDetails.removeItem(handlerType, taskId);
      }
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

  private _runFromThisTile(data: any, envelope: any) {
    this.testRunner
      .runFromTask(data)
      .subscribe(() => {
        if (isFunction(envelope.done)) {
          envelope.done();
        }
        this.refreshCurrentSelectedTaskIfNeeded();
      });
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
    flowUpdatePromise
      .then(() => this.testRunner.runFromRoot().toPromise())
      .then(() => this.refreshCurrentSelectedTaskIfNeeded());
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

}
