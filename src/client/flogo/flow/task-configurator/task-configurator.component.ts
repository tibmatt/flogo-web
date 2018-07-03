import * as _ from 'lodash';
import { skip, takeUntil } from 'rxjs/operators';

import { Component, Input, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

import { Task } from '@flogo/core/interfaces';
import { PostService } from '@flogo/core/services/post.service';
import { SingleEmissionSubject } from '@flogo/core/models';

import { PUB_EVENTS, SUB_EVENTS, SelectTaskConfigEventData, SaveTaskConfigEventData } from './messages';

import { MapperTranslator, MapperControllerFactory, MapperController } from '../shared/mapper';

import {FlogoFlowService as FlowsService} from '@flogo/flow/core';
import {Tabs} from '../shared/tabs/models/tabs.model';
import {SubFlowConfig} from './subflow-config';
import {isSubflowTask} from '@flogo/shared/utils';
import {ActionBase} from '@flogo/core';
import { createIteratorMappingContext, getIteratorOutputSchema, ITERABLE_VALUE_KEY, ITERATOR_OUTPUT_KEY } from './models';
import { Subscription } from 'rxjs';

const TASK_TABS = {
  SUBFLOW: 'subFlow',
  ITERATOR: 'iterator',
  INPUT_MAPPINGS: 'inputMappings'
};
const ITERATOR_TAB_INFO = { name: TASK_TABS.ITERATOR, labelKey: 'TASK-CONFIGURATOR:TABS:ITERATOR' };
const SUBFLOW_TAB_INFO = { name: TASK_TABS.SUBFLOW, labelKey: 'TASK-CONFIGURATOR:TABS:SUB-FLOW' };
const MAPPINGS_TAB_INFO = { name: TASK_TABS.INPUT_MAPPINGS, labelKey: 'TASK-CONFIGURATOR:TABS:MAP-INPUTS' };

@Component({
  selector: 'flogo-flow-task-configurator',
  styleUrls: [
    '../../../assets/_mapper-modal.less',
    'task-configurator.component.less'
  ],
  templateUrl: 'task-configurator.component.html',
  animations: [
    trigger('dialog', [
      transition('void => *', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('250ms ease-in')
      ]),
      transition('* => void', [
        animate('250ms ease-in', style({ transform: 'translateY(-100%)', opacity: 0 }))
      ]),
    ])
  ],
})
export class TaskConfiguratorComponent implements OnDestroy {
  @Input()
  flowId: string;
  currentTile: Task;
  inputsSearchPlaceholderKey = 'TASK-CONFIGURATOR:ACTIVITY-INPUTS';

  inputScope: any[];
  tabs: Tabs;

  title: string;
  initialIteratorData: {
    iteratorModeOn: boolean;
    iterableValue: string;
  };
  iteratorModeOn = false;
  iterableValue: string;
  iterator: {};
  isSubflowType: boolean;
  subFlowConfig: SubFlowConfig;
  subflowList: ActionBase[];
  context: SelectTaskConfigEventData;
  showSubflowList = false;

  isActive = false;

  inputMapperController: MapperController;
  iteratorController: MapperController;

  private inputMapperStateSubscription: Subscription;
  private contextChange$ = SingleEmissionSubject.create();
  private _subscriptions: any[];

  constructor(
    private _flowService: FlowsService,
    private _postService: PostService,
    private mapperControllerFactory: MapperControllerFactory,
  ) {
    this.initSubscriptions();
    this.isSubflowType = false;
    this.resetState();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
    if (!this.contextChange$.isStopped) {
      this.contextChange$.emitAndComplete();
    }
  }

  selectSubFlow() {
    this._flowService.listFlowsForApp(this.context.appId).then(flows => {
      this.subflowList = flows.filter(flow => !(flow.id === this.context.actionId || flow.id === this.currentTile.settings.flowPath));
      this.showSubflowList = true;
    });
  }

  subFlowChanged(event) {
    const subFlowTab = this.tabs.get(TASK_TABS.SUBFLOW);
    this.showSubflowList = false;
    subFlowTab.isDirty = true;
    this.createSubflowConfig(event);
    this.context.subflowSchema = event;
    this.createChangedsubFlowConfig(event);
  }

  createChangedsubFlowConfig(event) {
    this.currentTile.name = event.name;
    this.currentTile.settings.flowPath = event.flowPath;
    this.currentTile.description = event.description;
    const mappings = [];
    const propsToMap = event.metadata ? event.metadata.input : [];
    this.resetInputMappingsController(propsToMap, this.inputScope, mappings);
  }

  onChangeIteratorMode() {
    this.iteratorModeOn = !this.iteratorModeOn;
    this.checkIsIteratorDirty();
    this.adjustIteratorInInputMapper();
  }

  save() {
    const isIterable = this.iteratorModeOn && !_.isEmpty(this.iterableValue);
    this._postService.publish(_.assign({}, PUB_EVENTS.saveTask, {
      data: <SaveTaskConfigEventData>{
        tile: this.currentTile,
        changedSubflowSchema: this.context.subflowSchema,
        iterator: {
          isIterable,
          iterableValue: isIterable ? this.iterableValue : undefined,
        },
        inputMappings: MapperTranslator.translateMappingsOut(this.inputMapperController.getCurrentState().mappings),
        handlerId: this.flowId
      }
    }));
    this.close();
  }

  selectTab(name: string) {
    this.tabs.markSelected(name);
    this.showSubflowList = false;
  }

  flowSelectionCancel(event) {
    this.showSubflowList = false;
  }

  cancel() {
    this.close();
  }

  trackTabsByFn(index, [tabName, tab]) {
    return tabName;
  }

  private onIteratorValueChange(newValue: string, isValid: boolean) {
    this.tabs.get(TASK_TABS.ITERATOR).isValid = MapperTranslator.isValidExpression(newValue);
    this.iterableValue = newValue;
    this.checkIsIteratorDirty();
  }

  private checkIsIteratorDirty() {
    const iteratorTab = this.tabs.get(TASK_TABS.ITERATOR);
    if (!this.initialIteratorData) {
      iteratorTab.isDirty = false;
      return;
    }

    let isDirty = false;
    if (this.initialIteratorData.iteratorModeOn && !this.iteratorModeOn) {
      isDirty = true;
    } else {
      isDirty = this.iteratorModeOn && this.iterableValue !== this.initialIteratorData.iterableValue;
    }
    iteratorTab.isDirty = isDirty;
  }

  private initSubscriptions() {
    const subHandlers = [
      _.assign({}, SUB_EVENTS.selectTask, { callback: this.initConfigurator.bind(this) })
    ];
    this._subscriptions = subHandlers.map(handler => this._postService.subscribe(handler));
  }

  private raisedByThisDiagram(id: string) {
    return this.flowId === (id || '');
  }

  private cancelSubscriptions() {
    if (_.isEmpty(this._subscriptions)) {
      return true;
    }
    this._subscriptions.forEach(this._postService.unsubscribe);
    return true;
  }

  private initConfigurator(eventData: SelectTaskConfigEventData, envelope: any) {
    if (!this.raisedByThisDiagram(eventData.handlerId)) {
      return;
    }
    this.ensurePreviousContextCleanup();
    this.contextChange$ = SingleEmissionSubject.create();
    this.context = eventData;
    this.currentTile = eventData.tile;
    this.title = eventData.title;
    this.inputScope = eventData.scope;
    this.isSubflowType = isSubflowTask(this.currentTile.type);
    this.iterator = eventData.iterator;
    this.resetState();

    if (!this.title && this.currentTile) {
      this.title = this.currentTile.name;
    }
    this.inputsSearchPlaceholderKey = eventData.inputsSearchPlaceholderKey || 'TASK-CONFIGURATOR:ACTIVITY-INPUTS';

    this.createInputMapperConfig(eventData);

    if (this.isSubflowType) {
      this.createSubflowConfig(eventData.subflowSchema);
    }
    if (this.iterator) {
      this.initIterator(eventData);
      this.adjustIteratorInInputMapper();
    }

    if (eventData.inputMappingsTabLabelKey) {
      this.tabs.get(TASK_TABS.INPUT_MAPPINGS).labelKey = 'TASK-CONFIGURATOR:TABS:MAP-OUTPUTS';
    }
    this.open();
  }

  private adjustIteratorInInputMapper() {
    if (this.iteratorModeOn) {
      this.enableIteratorInInputMapper();
    } else {
      this.disableIteratorInInputMapper();
    }
  }

  private enableIteratorInInputMapper() {
    const iteratorNode = this.mapperControllerFactory.createNodeFromSchema(getIteratorOutputSchema());
    this.inputMapperController.appendOutputNode(iteratorNode);
  }

  private disableIteratorInInputMapper() {
    this.inputMapperController.removeOutputNode(ITERATOR_OUTPUT_KEY);
  }

  private initIterator(eventData: SelectTaskConfigEventData) {
    this.iteratorModeOn = eventData.iterator.isIterable;
    this.initialIteratorData = {
      iteratorModeOn: this.iteratorModeOn,
      iterableValue: this.iterableValue,
    };
    const iterableValue = MapperTranslator.rawExpressionToString(eventData.iterator.iterableValue || '');
    const iteratorContext = createIteratorMappingContext(iterableValue);
    this.iteratorController = this.mapperControllerFactory.createController(
      iteratorContext.inputContext,
      this.inputScope,
      iteratorContext.mappings
    );
    this.iteratorController.state$
      .pipe(takeUntil(this.contextChange$))
      .subscribe((state) => {
        const iterableMapping = state.mappings[ITERABLE_VALUE_KEY];
        if (iterableMapping) {
          this.onIteratorValueChange(iterableMapping.expression, state.isValid);
        }
      });
  }

  private createInputMapperConfig(data: SelectTaskConfigEventData) {
    let propsToMap = [];
    let mappings = [];
    if (data.overridePropsToMap) {
      propsToMap = data.overridePropsToMap;
    } else if (this.isSubflowType) {
      propsToMap = data.subflowSchema.metadata ? data.subflowSchema.metadata.input : [];
    } else if (this.currentTile.attributes && this.currentTile.attributes.inputs) {
      propsToMap = this.currentTile.attributes.inputs;
    }
    if (data.overrideMappings) {
      mappings = data.overrideMappings;
    } else {
      mappings = this.currentTile.inputMappings;
    }
    this.resetInputMappingsController(propsToMap, this.inputScope, mappings);
  }

  private resetInputMappingsController(propsToMap, inputScope, mappings) {
    if (this.inputMapperStateSubscription && !this.inputMapperStateSubscription.closed) {
      this.inputMapperStateSubscription.unsubscribe();
    }
    this.inputMapperController = this.mapperControllerFactory.createController(propsToMap, inputScope, mappings);
    this.inputMapperStateSubscription = this.inputMapperController.status$
      .pipe(
        skip(1),
        takeUntil(this.contextChange$)
      )
      .subscribe(({isValid, isDirty}) => {
        const inputMappingsTab = this.tabs.get(TASK_TABS.INPUT_MAPPINGS);
        inputMappingsTab.isValid = isValid;
        inputMappingsTab.isDirty = isDirty;
      });
  }

  private createSubflowConfig(subflowSchema: ActionBase) {
    this.subFlowConfig = {
      name: subflowSchema.name,
      description: subflowSchema.description,
      createdAt: subflowSchema.createdAt,
      flowPath: subflowSchema.id
    };
  }

  private resetState() {
    if (this.tabs) {
      this.tabs.clear();
    }
    let tabsInfo = [MAPPINGS_TAB_INFO];
    this.showSubflowList = false;
    if (this.isSubflowType) {
      tabsInfo = [SUBFLOW_TAB_INFO, ...tabsInfo, ITERATOR_TAB_INFO];
      this.tabs = Tabs.create(tabsInfo);
      this.tabs.get(TASK_TABS.SUBFLOW).isSelected = true;
    } else if (this.iterator) {
      tabsInfo = [...tabsInfo, ITERATOR_TAB_INFO];
      this.tabs = Tabs.create(tabsInfo);
      this.tabs.get(TASK_TABS.INPUT_MAPPINGS).isSelected = true;
    } else {
      this.tabs = Tabs.create(tabsInfo);
      this.tabs.get(TASK_TABS.INPUT_MAPPINGS).isSelected = true;
    }
  }

  private open() {
    this.isActive = true;
  }

  private close() {
    this.contextChange$.emitAndComplete();
    this.isActive = false;
  }

  private ensurePreviousContextCleanup() {
    if (this.contextChange$ && !this.contextChange$.isStopped) {
      this.contextChange$.emitAndComplete();
    }
  }

}
