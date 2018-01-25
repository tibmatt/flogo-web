import * as _ from 'lodash';

import { Component, Input, OnDestroy,
  trigger, transition, style, animate, state, AnimationTransitionEvent
} from '@angular/core';

import { PostService } from '@flogo/core/services/post.service';

import { PUB_EVENTS, SUB_EVENTS, SelectTaskConfigEventData, SaveTaskConfigEventData } from './messages';

import { IMapping, Mappings, MapperTranslator } from '../shared/mapper';

import { IFlogoFlowDiagramTask } from '../shared/diagram/models/task.model';
import { InputMapperConfig } from './input-mapper';

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
  currentTile: IFlogoFlowDiagramTask;
  inputsSearchPlaceholderKey = 'TRANSFORM:ACTIVITY-INPUTS';

  inputScope: any[];
  inputMappingsConfig: InputMapperConfig;

  title: string;
  isInputMappingsValid: boolean;
  isIteratorValid: boolean;
  isMapperDirty: boolean;
  isIteratorDirty: boolean;
  displayIterators = false;
  displayMapInputs = true;
  initialIteratorData: {
    iteratorModeOn: boolean;
    iterableValue: string;
  };
  iteratorModeOn = false;
  iterableValue: string;
  currentMappings: Mappings;

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
    this.isInputMappingsValid = this.areValidMappings({ mappings: newMappings });
    this.isMapperDirty = true;
    this.currentMappings = _.cloneDeep(newMappings);
  }

  onIteratorValueChange(newValue: string) {
    this.isIteratorValid = MapperTranslator.isValidExpression(newValue);
    this.iterableValue = newValue;
    this.checkIsIteratorDirty();
  }

  onChangeIteratorMode() {
    this.iteratorModeOn = !this.iteratorModeOn;
    this.checkIsIteratorDirty();
  }

  get isValid() {
    return this.isInputMappingsValid || this.isIteratorValid;
  }

  get isDirty() {
    return this.isMapperDirty || this.isIteratorDirty;
  }

  saveTransform() {
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

  cancel() {
    this.close();
  }

  showIterators() {
    this.displayIterators = true;
    this.displayMapInputs = false;
  }

  showMapInputs() {
    this.displayMapInputs = true;
    this.displayIterators = false;
  }

  private checkIsIteratorDirty() {
    if (!this.initialIteratorData) {
      this.isIteratorDirty = false;
      return;
    }

    let isDirty = false;
    if (this.initialIteratorData.iteratorModeOn && !this.iteratorModeOn) {
      isDirty = true;
    } else {
      isDirty = this.iteratorModeOn && this.iterableValue !== this.initialIteratorData.iterableValue;
    }
    this.isIteratorDirty = isDirty;
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

  private initConfigurator(data: SelectTaskConfigEventData, envelope: any) {
    if (!this.raisedByThisDiagram(data.handlerId)) {
      return;
    }
    this.resetState();
    this.currentTile = data.tile;
    this.title = data.title;
    this.inputScope = data.scope;

    if (!this.title && this.currentTile) {
      this.title = this.currentTile.title;
    }
    this.inputsSearchPlaceholderKey = data.inputsSearchPlaceholderKey || 'TRANSFORM:ACTIVITY-INPUTS';

    this.createInputMapperConfig(data);

    this.iteratorModeOn = data.iterator.isIterable;
    this.iterableValue = data.iterator.iterableValue;
    this.initialIteratorData = {
      iteratorModeOn: this.iteratorModeOn,
      iterableValue: this.iterableValue,
    };

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

    this.inputMappingsConfig = {
      inputScope: this.inputScope,
      propsToMap,
      inputMappings: mappings
    };
  }

  private resetState() {
    this.isInputMappingsValid = true;
    this.isIteratorValid = true;
    this.isMapperDirty = false;
    this.displayIterators = false;
    this.displayMapInputs = true;
  }

  private open() {
    this.modalState = 'visible';
  }

  private close() {
    this.modalState = 'hidden';
  }

}
