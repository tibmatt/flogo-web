import * as _ from 'lodash';

import { Component, Input, OnDestroy,
  trigger, transition, style, animate, state, AnimationTransitionEvent
} from '@angular/core';

import { PostService } from '@flogo/core/services/post.service';

import { PUB_EVENTS, SUB_EVENTS, SelectTaskData } from './messages';

import { IMapping, IMapExpression, MapperTranslator, StaticMapperContextFactory } from '../shared/mapper';

import { IFlogoFlowDiagramTask } from '../shared/diagram/models/task.model';
import { IFlogoFlowDiagramTaskAttribute } from '../shared/diagram/models/attribute.model';
import { IFlogoFlowDiagramTaskAttributeMapping } from '../shared/diagram/models/attribute-mapping.model';

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
  inputsSearchPlaceholderKey = 'TRANSFORM:ACTIVITY-INPUTS';

  title: string;
  isValid: boolean;
  isDirty: boolean;

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
    this.isValid = this.areValidMappings(change);
    this.isDirty = true;
    this.currentMappings = _.cloneDeep(change).mappings;
  }

  saveTransform() {
    this._postService.publish(_.assign({}, PUB_EVENTS.saveTransform, {
      data: {
        tile: this.currentTile,
        inputMappings: MapperTranslator.translateMappingsOut(this.currentMappings),
        id: this.flowId
      }
    }));
    this.close();
  }

  cancel() {
    this.close();
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

    this.mapperContext = this.createContext(propsToMap, mappings, data.scope);
    this.areValidMappings = MapperTranslator.makeValidator();
    this.open();
  }

  private createContext(propsToMap: IFlogoFlowDiagramTaskAttribute[],
                        inputMappings: IFlogoFlowDiagramTaskAttributeMapping[],
                        scope: IFlogoFlowDiagramTask[]) {
    const inputSchema = MapperTranslator.attributesToObjectDescriptor(propsToMap);
    const outputSchema = MapperTranslator.createOutputSchema(scope);
    const mappings = MapperTranslator.translateMappingsIn(inputMappings);
    return StaticMapperContextFactory.create(inputSchema, outputSchema, mappings);
  }

  private resetState() {
    this.isValid = true;
    this.isDirty = false;
  }

  private open() {
    this.modalState = 'visible';
  }

  private close() {
    this.modalState = 'hidden';
  }

}
