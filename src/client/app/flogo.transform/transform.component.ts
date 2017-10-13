import * as _ from 'lodash';

import {
  Component, ViewChild, ElementRef, Input, OnDestroy, HostListener,
  trigger, transition, style, animate, state, AnimationTransitionEvent
} from '@angular/core';

import { PostService } from '../../common/services/post.service';

import { PUB_EVENTS, SUB_EVENTS, SelectTaskData } from './messages';

import { IMapping, IMapExpression } from '../flogo.mapper/models/map-model';
import { IFlogoFlowDiagramTask } from '../flogo.flows.detail.diagram/models/task.model';
import { MapperTranslator } from './mapper-translator';
import { MapperContextFactory } from './mapper-context-factory';

@Component({
  selector: 'flogo-transform',
  styleUrls: ['transform.component.less'],
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
    this.resetState();
    this.mapperContext = this.createContext(data.tile, data.scope);
    this.open();
  }

  // todo: get data from event
  private createContext(inputTile: IFlogoFlowDiagramTask, scope: IFlogoFlowDiagramTask[]) {
    const inputSchema = MapperTranslator.createInputSchema(inputTile);
    const outputSchema = MapperTranslator.createOutputSchema(scope);
    const mappings = MapperTranslator.translateMappingsIn(inputTile.inputMappings);
    return MapperContextFactory.create(inputSchema, outputSchema, mappings);
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
