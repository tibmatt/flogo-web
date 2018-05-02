import * as _ from 'lodash';

import { Component, Input, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

import { Task } from '@flogo/core/interfaces';
import { PostService } from '@flogo/core/services/post.service';

import { PUB_EVENTS, SUB_EVENTS, SelectTaskConfigEventData, SaveTaskConfigEventData } from './messages';

import { IMapping, Mappings, MapperTranslator } from '../shared/mapper';

import { InputMapperConfig } from './input-mapper';
import {Tabs} from '../shared/tabs/models/tabs.model';
import {SubFlowConfig} from './subflow-config';
import {isSubflowTask} from '@flogo/shared/utils';
import {FlogoFlowService as FlowsService} from '@flogo/flow/core';
import {ActionBase} from '@flogo/core';

const TASK_TABS = {
  SUBFLOW: 'subflow',
  ITERATOR: 'iterator',
  INPUT_MAPPINGS: 'inputMappings'
};

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

  inputMappingsConfig: InputMapperConfig;
  currentMappings: Mappings;
  isSubflowType: boolean;
  subFlowConfig: SubFlowConfig;
  subflowList: ActionBase[];
  context: SelectTaskConfigEventData;
  showSubflowList = false;

  isActive = false;
  defaultTabsInfo: {name: string, labelKey: string}[] = [
    { name: TASK_TABS.INPUT_MAPPINGS, labelKey: 'TASK-CONFIGURATOR:TABS:MAP-INPUTS' },
    { name: TASK_TABS.ITERATOR, labelKey: 'TASK-CONFIGURATOR:TABS:ITERATOR' },
  ];

  private _subscriptions: any[];
  // todo: move to proper service
  private areValidMappings: (mappings: IMapping) => boolean;

  constructor(private _flowService: FlowsService,
              private _postService: PostService) {
    this.initSubscriptions();
    this.isSubflowType = false;
    this.resetState();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  onMappingsChange(newMappings: Mappings) {
    const mapperTab = this.tabs.get(TASK_TABS.INPUT_MAPPINGS);
    mapperTab.isValid = this.areValidMappings({mappings: newMappings});
    mapperTab.isDirty = true;
    this.currentMappings = _.cloneDeep(newMappings);
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
    this.currentMappings = MapperTranslator.translateMappingsIn(mappings);
    this.inputMappingsConfig = {
      inputScope: this.inputScope,
      propsToMap,
      inputMappings: mappings
    };
  }

  onIteratorValueChange(newValue: string) {
    this.tabs.get(TASK_TABS.ITERATOR).isValid = MapperTranslator.isValidExpression(newValue);
    this.iterableValue = newValue;
    this.checkIsIteratorDirty();
  }

  onChangeIteratorMode() {
    this.iteratorModeOn = !this.iteratorModeOn;
    this.checkIsIteratorDirty();
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
        inputMappings: MapperTranslator.translateMappingsOut(this.currentMappings),
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
    this.context = eventData;
    this.currentTile = eventData.tile;
    this.title = eventData.title;
    this.inputScope = eventData.scope;
    this.isSubflowType = isSubflowTask(this.currentTile.type);
    this.resetState();

    if (!this.title && this.currentTile) {
      this.title = this.currentTile.name;
    }
    this.inputsSearchPlaceholderKey = eventData.inputsSearchPlaceholderKey || 'TASK-CONFIGURATOR:ACTIVITY-INPUTS';

    this.createInputMapperConfig(eventData);
    if (this.isSubflowType) {
      this.createSubflowConfig(eventData.subflowSchema);
    }
    this.iteratorModeOn = eventData.iterator.isIterable;
    this.iterableValue = MapperTranslator.rawExpressionToString(eventData.iterator.iterableValue || '');
    this.initialIteratorData = {
      iteratorModeOn: this.iteratorModeOn,
      iterableValue: this.iterableValue,
    };

    if (eventData.inputMappingsTabLabelKey) {
      this.tabs.get(TASK_TABS.INPUT_MAPPINGS).labelKey = 'TASK-CONFIGURATOR:TABS:MAP-OUTPUTS';
    }

    this.areValidMappings = MapperTranslator.makeValidator();
    this.open();
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

    this.currentMappings = MapperTranslator.translateMappingsIn(mappings);
    this.inputMappingsConfig = {
      inputScope: this.inputScope,
      propsToMap,
      inputMappings: mappings
    };
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
    this.showSubflowList = false;
    if (this.isSubflowType) {
      this.defaultTabsInfo.unshift({name: TASK_TABS.SUBFLOW, labelKey: 'TASK-CONFIGURATOR:TABS:SUB-FLOW'});
      this.tabs = Tabs.create(this.defaultTabsInfo);
      this.tabs.get(TASK_TABS.SUBFLOW).isSelected = true;
    } else {
      this.defaultTabsInfo = this.defaultTabsInfo.filter(val => val.name !==  TASK_TABS.SUBFLOW);
      this.tabs = Tabs.create(this.defaultTabsInfo);
      this.tabs.get( TASK_TABS.INPUT_MAPPINGS).isSelected = true;
    }
  }

  private open() {
    this.isActive = true;
  }

  private close() {
    this.isActive = false;
  }

}
