import * as _ from 'lodash';

import { Component, Input, OnDestroy,
  trigger, transition, style, animate, state, AnimationTransitionEvent
} from '@angular/core';

import { PostService } from '@flogo/core/services/post.service';

import { PUB_EVENTS, SUB_EVENTS, SelectTaskData, SaveTransformData } from './messages';

import { IMapping, IMapExpression, MapperTranslator, StaticMapperContextFactory } from '../shared/mapper';

import { IFlogoFlowDiagramTask } from '../shared/diagram/models/task.model';
import { IFlogoFlowDiagramTaskAttribute } from '../shared/diagram/models/attribute.model';
import { IFlogoFlowDiagramTaskAttributeMapping } from '../shared/diagram/models/attribute-mapping.model';
import { MapperSchema } from '@flogo/flow/task-mapper/models';

const ITERABLE_VALUE_KEY = 'iterate';

@Component({
  selector: 'flogo-flow-task-mapper',
  styleUrls: [
    '../../../assets/_mapper-modal.less',
    'task-mapper.component.less'
  ],
  templateUrl: 'task-mapper.component.html',
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
export class TaskMapperComponent implements OnDestroy {
  @Input()
  flowId: string;
  currentTile: IFlogoFlowDiagramTask;
  mapperContext: any;
  iteratorContext: any;
  inputsSearchPlaceholderKey = 'TRANSFORM:ACTIVITY-INPUTS';

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

  // Two variables control the display of the modal to support animation when opening and closing: modalState and isActive.
  // this is because the contents of the modal need to visible up until the close animation finishes
  // modalState = 'inactive' || 'active'
  // TODO: we might be able to use a single variable when upgrading to angular >= 4.x as it allows to animate with *ngIf
  // controls the in/out transition of the modal
  modalState: 'visible'|'hidden' = 'hidden';
  // controls the rendering of the content of the modal
  isActive = false;

  private _subscriptions: any[];
  private currentMappings: { [key: string]: IMapExpression };
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

  onMappingsChange(change: IMapping) {
    this.isInputMappingsValid = this.areValidMappings(change);
    this.isMapperDirty = true;
    this.currentMappings = _.cloneDeep(change).mappings;
  }

  onIteratorValueChange(change: IMapping) {
    this.isIteratorValid = this.areValidMappings(change);
    this.iterableValue = change.mappings[ITERABLE_VALUE_KEY].expression;
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
    this._postService.publish(_.assign({}, PUB_EVENTS.saveTransform, {
      data: <SaveTransformData>{
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

  changeIteratorMode(event) {
    this.iteratorModeOn = !!event.target.checked;
    this.checkIsIteratorDirty();
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
      _.assign({}, SUB_EVENTS.selectActivity, { callback: this.initTransformation.bind(this) })
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

  private initTransformation(data: SelectTaskData, envelope: any) {
    if (!this.raisedByThisDiagram(data.handlerId)) {
      return;
    }
    this.currentTile = data.tile;
    this.title = data.title;
    if (!this.title && this.currentTile) {
      this.title = this.currentTile.title;
    }
    this.inputsSearchPlaceholderKey = data.inputsSearchPlaceholderKey || 'TRANSFORM:ACTIVITY-INPUTS';
    this.resetState();

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

    this.iteratorModeOn = data.iterator.isIterable;
    this.iterableValue = data.iterator.iterableValue;
    this.initialIteratorData = {
      iteratorModeOn: this.iteratorModeOn,
      iterableValue: this.iterableValue,
    };

    this.mapperContext = this.createInputMapperContext(propsToMap, mappings, data.scope);
    this.iteratorContext = this.createIteratorContext(this.iterableValue, data.scope);
    this.areValidMappings = MapperTranslator.makeValidator();
    this.open();
  }

  private createInputMapperContext(propsToMap: IFlogoFlowDiagramTaskAttribute[],
                                   inputMappings: IFlogoFlowDiagramTaskAttributeMapping[],
                                   scope: IFlogoFlowDiagramTask[]) {
    const inputSchema = MapperTranslator.attributesToObjectDescriptor(propsToMap);
    const outputSchema = MapperTranslator.createOutputSchema(scope);
    const outputSchemaWithIterator = MapperTranslator.createOutputSchema(scope, { $current: this.getIteratorSchema() });
    const mappings = MapperTranslator.translateMappingsIn(inputMappings);
    const context = StaticMapperContextFactory.create(inputSchema, outputSchema, mappings);
    context.getScopedOutputSchemaProvider = () => {
      return {
        getSchema: () => this.iteratorModeOn ? outputSchemaWithIterator : outputSchema
      };
    };
    return context;
  }

  private createIteratorContext(iterableValue: string, scope: IFlogoFlowDiagramTask[]) {
    const outputSchema = MapperTranslator.createOutputSchema(scope);
    return StaticMapperContextFactory.create({
      type: 'object',
      properties: {
        [ITERABLE_VALUE_KEY]: {
          type: 'string'
        }
      }
    }, outputSchema, {
      [ITERABLE_VALUE_KEY]: { expression: iterableValue, mappings: {} }
    });
  }

  private resetState() {
    this.isInputMappingsValid = true;
    this.isIteratorValid = true;
    this.isMapperDirty = false;
  }

  private open() {
    this.modalState = 'visible';
  }

  private close() {
    this.modalState = 'hidden';
  }

  private getIteratorSchema(): MapperSchema {
    return {
      type: 'object',
      properties: {
        iteration: {
          type: 'object',
          properties: {
            key: {
              type: 'string'
            },
            value: {
              type: 'any'
            }
          }
        }
      }
    };
  }

}
