import {
  cloneDeep,
  filter as _filter,
  get,
  isEmpty,
} from 'lodash';
import { takeUntil, switchMap, take, filter } from 'rxjs/operators';
import { Component, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger as animationTrigger, transition, animateChild } from '@angular/animations';
import {
  MetadataAttribute,
  Task,
  LanguageService,
  Item,
} from '@flogo/core';

import { NotificationsService } from '@flogo/core/notifications';

import { FlowData } from './core';
import { FlowMetadata } from './task-configurator/models/flow-metadata';

import { AppsApiService } from '../core/services/restapi/v2/apps-api.service';
import { RESTAPIHandlersService } from '../core/services/restapi/v2/handlers-api.service';
import {
  FLOGO_PROFILE_TYPE,
  FLOGO_TASK_TYPE
} from '../core/constants';
import { getProfileType, isMapperActivity } from '@flogo/shared/utils';

import { FlogoFlowService as FlowsService } from './core/flow.service';
import { ParamsSchemaComponent } from './params-schema/params-schema.component';
import { mergeItemWithSchema } from '@flogo/core/models';
import { HandlerType, SelectionType } from './core/models';
import { FlowState } from './core/state';

import { SingleEmissionSubject } from '@flogo/core/models';
import { Trigger } from './core';
import { TestRunnerService } from '@flogo/flow/core/test-runner/test-runner.service';
import {ConfirmationResult} from '@flogo/core';
import {ConfirmationModalService} from '@flogo/core/confirmation/confirmation-modal/confirmation-modal.service';
import { MonacoEditorLoaderService } from '@flogo/flow/shared/monaco-editor';

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
  animations: [
    animationTrigger('initialAnimation', [ transition( 'void => *', animateChild()) ]),
  ],
})
export class FlowComponent implements OnInit, OnDestroy {
  @HostBinding('@initialAnimation') initialAnimation = true;
  @ViewChild('inputSchemaModal') defineInputSchema: ParamsSchemaComponent;
  public flowState: FlowState;
  public triggersList: Trigger[];
  public runnableInfo: {
    disabled: boolean;
    disableReason?: string;
  };

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
              private _flowService: FlowsService,
              private _restAPIHandlerService: RESTAPIHandlersService,
              private _restAPIAppsService: AppsApiService,
              private _router: Router,
              private confirmationModalService: ConfirmationModalService,
              private _route: ActivatedRoute,
              private testRunner: TestRunnerService,
              private notifications: NotificationsService,
              private monacoLoaderService: MonacoEditorLoaderService) {
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
    this.flowDetails.runnableState$
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(runnableState => this.runnableInfo = runnableState);
    this.monacoLoaderService.isMonacoLoaded
      .pipe(filter(Boolean), take(1), takeUntil(this.ngOnDestroy$))
      .subscribe((loaded) => {
        if (loaded) {
          this.loading = false;
        }
      });
  }

  toggleFlowMenu() {
    this.isflowMenuOpen = !this.isflowMenuOpen;
  }

  closeFlowMenu() {
    this.isflowMenuOpen = false;
  }

  private get flowDetails() {
    return this._flowService.currentFlowDetails;
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
          .then(() => this.navigateToApp())
          .then(() => this.notifications.success({ key: 'FLOWS:SUCCESS-MESSAGE-FLOW-DELETED' }))
          .catch(err => {
            console.error(err);
            this.notifications.error({ key: 'FLOWS:ERROR-MESSAGE-REMOVE-FLOW', params: err });
          });
      }
    });
  }

  onDeleteTask(taskDetails) {
    this._deleteTaskFromDiagram(taskDetails.handlerType, taskDetails.itemId);
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

  private _getCurrentTaskContext(taskId: any): TaskContext {
    const handlerId = this.getDiagramId(taskId);
    const taskType = this.getTaskInHandler(handlerId, taskId).type;
    return {
      isTrigger: false, // taskType === FLOGO_TASK_TYPE.TASK_ROOT,
      isBranch: taskType === FLOGO_TASK_TYPE.TASK_BRANCH,
      isTask: taskType === FLOGO_TASK_TYPE.TASK || taskType === FLOGO_TASK_TYPE.TASK_SUB_PROC,
      shouldSkipTaskConfigure: taskType !== FLOGO_TASK_TYPE.TASK_BRANCH,
      profileType: this.profileType,
      // can't run from tile anymore in this panel, hardcoding to false until we remove the right panel
      hasProcess: false,
      flowRunDisabled: this.runnableInfo && this.runnableInfo.disabled,
      isDiagramEdited: this._isDiagramEdited,
      app: null,
      currentTrigger: null,
    };
  }

  private getItemsByHandlerId(id: string) {
    return id === HandlerType.Main ? this.flowState.mainItems : this.flowState.errorItems;
  }

  private getTaskInHandler(handlerId: string, taskId: string) {
    return this.getItemsByHandlerId(handlerId)[taskId];
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
          this.notifications.success({ key: 'CANVAS:SUCCESS-MESSAGE-UPDATE', params: { value: property } });
        }
        return wasSaved;
      })
      .catch(() => this.notifications.error({ key: 'CANVAS:ERROR-MESSAGE-UPDATE', params: { value: property }  }));
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
          this.flowState.name = this.flowName;
          this.notifications.error({ key: 'CANVAS:FLOW-NAME-EXISTS', params: { value: name } });
          return results;
        } else {
          this.flowState.name = name;
          this._updateFlow()
            .then((response: any) => {
              this.notifications.success({ key: 'CANVAS:SUCCESS-MESSAGE-UPDATE', params: { value: property } });
              this.flowName = this.flowState.name;
              return response;
            }).catch((err) => {
              this.notifications.error({ key: 'CANVAS:ERROR-MESSAGE-UPDATE', params: { value: property } });
              return Promise.reject(err);
            });
        }
      })
      .catch((err) => {
        this.notifications.error({ key: 'CANVAS:ERROR-MESSAGE-UPDATE', params: { value: property } });
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

  private _getAllTasks() {
    return {...this.flowState.mainItems, ...this.flowState.errorItems};
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
    _filter(this._getAllTasks(), isMapperContribAndHasMapping)
      .forEach((task: Task) => {
        task.attributes.inputs.forEach((mapping) => {
          mapping.value = mapping.value.filter((m) => outputRegistry.has(m.mapTo));
        });
      });
  }

}
