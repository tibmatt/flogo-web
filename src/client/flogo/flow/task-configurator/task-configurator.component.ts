import * as _ from 'lodash';

import { Component, Input, OnDestroy,
  trigger, transition, style, animate, state, AnimationTransitionEvent
} from '@angular/core';


import { Task } from '@flogo/core/interfaces';
import { PostService } from '@flogo/core/services/post.service';

import { PUB_EVENTS, SUB_EVENTS, SelectTaskConfigEventData, SaveTaskConfigEventData } from './messages';

import { IMapping, Mappings, MapperTranslator } from '../shared/mapper';

import { InputMapperConfig } from './input-mapper';
import { TAB_NAME, Tabs } from './models/tabs.model';
import {SubFlowConfig} from '../../core/interfaces/flow/subflow-config';
import {isSubflowTask} from '@flogo/shared/utils';

@Component({
  selector: 'flogo-flow-task-configurator',
  styleUrls: [
    '../../../assets/_mapper-modal.less',
    'task-configurator.component.less'
  ],
  templateUrl: 'task-configurator.component.html',
  animations: [
    trigger('dialog', [
      state('hidden', style({
        transform: 'translateY(-100%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('hidden => visible', [
        animate('300ms ease-out')
      ]),
      transition('visible => hidden', [
        animate('250ms ease-in')
      ])
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

  // Two variables control the display of the modal to support animation when opening and closing: modalState and isActive.
  // this is because the contents of the modal need to visible up until the close animation finishes
  // modalState = 'inactive' || 'active'
  // TODO: we might be able to use a single variable when upgrading to angular >= 4.x as it allows to animate with *ngIf
  // controls the in/out transition of the modal
  modalState: 'visible'|'hidden' = 'hidden';
  // controls the rendering of the content of the modal
  isActive = false;

  private _subscriptions: any[];
  // todo: move to proper service
  private areValidMappings: (mappings: IMapping) => boolean;

  constructor(private _postService: PostService) {
    this.initSubscriptions();
    this.isSubflowType = false;
    this.resetState();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  onModalStateChange(event: AnimationTransitionEvent) {
    if (event.toState === 'visible' && event.phaseName === 'start') {
      this.isActive = true;
    } else if (event.toState === 'hidden' && event.phaseName === 'done') {
      this.isActive = false;
    }
  }

  onMappingsChange(newMappings: Mappings) {
    const mapperTab = this.tabs.get('inputMappings');
    mapperTab.isValid = this.areValidMappings({ mappings: newMappings });
    mapperTab.isDirty = true;
    this.currentMappings = _.cloneDeep(newMappings);
  }

  onIteratorValueChange(newValue: string) {
    this.tabs.get('iterator').isValid = MapperTranslator.isValidExpression(newValue);
    this.iterableValue = newValue;
    this.checkIsIteratorDirty();
  }

  onChangeIteratorMode() {
    this.iteratorModeOn = !this.iteratorModeOn;
    this.checkIsIteratorDirty();
  }

  get isValid() {
    return this.tabs.areDirty();
  }

  get isDirty() {
    return this.tabs.areDirty();
  }

  save() {
    const isIterable = this.iteratorModeOn && !_.isEmpty(this.iterableValue);
    this._postService.publish(_.assign({}, PUB_EVENTS.saveTask, {
      data: <SaveTaskConfigEventData>{
        tile: this.currentTile,
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

  selectTab(name: TAB_NAME) {
    this.tabs.markSelected(name);
  }

  cancel() {
    this.close();
  }

  trackTabsByFn(index, [tabName, tab]) {
    return tabName;
  }

  private checkIsIteratorDirty() {
    const iteratorTab = this.tabs.get('iterator');
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
      this.createSubflowConfig(eventData);
    }
    this.iteratorModeOn = eventData.iterator.isIterable;
    this.iterableValue = MapperTranslator.rawExpressionToString(eventData.iterator.iterableValue || '');
    this.initialIteratorData = {
      iteratorModeOn: this.iteratorModeOn,
      iterableValue: this.iterableValue,
    };

    if (eventData.inputMappingsTabLabelKey) {
      this.tabs.get('inputMappings').labelKey = 'TASK-CONFIGURATOR:TABS:MAP-OUTPUTS';
    }

    this.areValidMappings = MapperTranslator.makeValidator();
    this.open();
  }

  private createInputMapperConfig(data: SelectTaskConfigEventData) {
    let propsToMap = [];
    let mappings = [];
    if (data.overridePropsToMap) {
      propsToMap = data.overridePropsToMap;
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

  private createSubflowConfig(data: SelectTaskConfigEventData) {
    this.subFlowConfig = {
      name: data.subflowSchema.name,
      description: data.subflowSchema.description,
      createdAt: data.subflowSchema.createdAt,
      flowRef: data.subflowSchema.id
    };
  }

  private resetState() {
    if (this.tabs) {
      this.tabs.clear();
    }
    this.tabs = Tabs.create(this.isSubflowType);

    if (this.isSubflowType) {
      this.tabs.get('subFlow').isSelected = true;
    } else {
      this.tabs.get('inputMappings').isSelected = true;
    }

  }

  private open() {
    this.modalState = 'visible';
  }

  private close() {
    this.modalState = 'hidden';
  }

}
