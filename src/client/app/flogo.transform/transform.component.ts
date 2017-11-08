import * as _ from 'lodash';

import {
  Component, ViewChild, ElementRef, Input, OnDestroy, HostListener,
  trigger, transition, style, animate, state, AnimationTransitionEvent
} from '@angular/core';

import { PostService } from '../../common/services/post.service';

import { PUB_EVENTS, SUB_EVENTS, SelectTaskData } from './messages';

import { IMapping, IMapExpression, MapperTranslator, StaticMapperContextFactory } from '../flogo.mapper';

import { IFlogoFlowDiagramTask } from '../flogo.flows.detail.diagram/models/task.model';
import { IFlogoFlowDiagramTaskAttribute } from '../flogo.flows.detail.diagram/models/attribute.model';
import { IFlogoFlowDiagramTaskAttributeMapping } from '../flogo.flows.detail.diagram/models/attribute-mapping.model';
import { isMapperActivity } from '../../common/utils';

@Component({
  selector: 'flogo-transform',
  styleUrls: [
    '../../common/styles/_mapper-modal.less',
    'transform.component.less'
  ],
  templateUrl: 'transform.component.html',
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
export class TransformComponent implements OnDestroy {
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

  showDeleteConfirmation = false;
  @ViewChild('deleteContainer') deleteContainer: ElementRef;

  private _subscriptions: any[];
  private currentMappings: { [key: string]: IMapExpression };

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
    this.isValid = true;
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

  deleteTransform() {
    this._postService.publish(_.assign({}, PUB_EVENTS.deleteTransform, {
      data: {
        tile: this.currentTile,
        id: this.flowId
      }
    }));
    this.close();
  }

  cancel() {
    this.close();
  }

  openDeleteConfirmation(event: Event) {
    this.showDeleteConfirmation = true;
    event.stopPropagation();
  }

  cancelDeleteConfirmation() {
    this.showDeleteConfirmation = false;
  }

  @HostListener('click', ['$event'])
  clickOutsideDeleteConfirmation(event: Event) {
    if (this.showDeleteConfirmation && this.deleteContainer && !this.deleteContainer.nativeElement.contains(event.target)) {
      this.showDeleteConfirmation = false;
    }
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
    if (data.overridePropsToMap) {
      propsToMap = data.overridePropsToMap;
    } else if (this.currentTile.attributes && this.currentTile.attributes.inputs) {
      propsToMap = this.currentTile.attributes.inputs;
    }
    this.mapperContext = this.createContext(propsToMap, this.currentTile.inputMappings, data.scope);
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
    this.showDeleteConfirmation = false;
  }

  private open() {
    this.modalState = 'visible';
  }

  private close() {
    this.modalState = 'hidden';
  }

}
