import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FLOGO_PROFILE_TYPE} from '../../../common/constants';
import {notification, objectFromArray} from '../../../common/utils';
import {RESTAPITriggersService} from '../../../common/services/restapi/v2/triggers-api.service';
import {RESTAPIHandlersService} from '../../../common/services/restapi/v2/handlers-api.service';
import {Router} from '@angular/router';
import {PostService} from '../../../common/services/post.service';
import {
  SUB_EVENTS as FLOGO_SELECT_TRIGGER_PUB_EVENTS,
  PUB_EVENTS as FLOGO_SELECT_TRIGGER_SUB_EVENTS
} from '../../flogo.flows.detail.triggers.detail/messages';
import {UIModelConverterService} from '../../flogo.flows.detail/services/ui-model-converter.service';
import { PUB_EVENTS as FLOGO_TASK_SUB_EVENTS} from '../../flogo.form-builder/messages';
import {TranslateService} from 'ng2-translate';
import {FlogoTriggerClickHandlerService} from '../services/click-handler.service';
import { FlowMetadata } from '../../flogo.transform/models';
import { TriggerMapperService } from '../../flogo.trigger-mapper/trigger-mapper.service';
import { Subscription } from 'rxjs/Subscription';

export interface IFlogoTrigger {
  name: string;
  ref: string;
  description: string;
  settings: any;
  id: string;
  createdAt: string;
  updatedAt: string | null;
  handlers: any[];
  appId: string;
}

@Component({
  selector : 'flogo-flows-detail-triggers-panel',
  templateUrl : 'triggers-panel.tpl.html',
  styleUrls : [ 'triggers-panel.component.less' ]
})
export class FlogoFlowTriggersPanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  triggers: IFlogoTrigger[];
  @Input()
  actionId: string;
  @Input()
  appDetails: {appId: string, appProfileType:  FLOGO_PROFILE_TYPE, metadata?: FlowMetadata};
  triggersList: any[] = [];
  allowMultipleTriggers = true;
  currentTrigger: any;
  selectedTriggerID: string;
  displayTriggerMenuPopover: boolean;
  showAddTrigger = false;
  installTriggerActivated = false;

  private _subscriptions: any[];
  private _triggerMapperSubscription: Subscription;

  constructor(private _restAPITriggersService: RESTAPITriggersService,
              private _restAPIHandlerService: RESTAPIHandlersService,
              private _converterService: UIModelConverterService,
              private _router: Router,
              private translate: TranslateService,
              private _clickHandler: FlogoTriggerClickHandlerService,
              private _postService: PostService,
              private _triggerMapperService: TriggerMapperService) {
  }

  ngOnInit() {
    this.initSubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['triggers']) {
      this.makeTriggersListForAction();
      this.manageAddTriggerInView();
    }
  }

  ngOnDestroy() {
    this._subscriptions.forEach(
      ( sub: any ) => {
        this._postService.unsubscribe( sub );
      }
    );
  }

  isLambda(trigger) {
    return trigger && trigger.ref === 'github.com/TIBCOSoftware/flogo-contrib/trigger/lambda';
  }

  private isDeviceType() {
    return this.appDetails.appProfileType === FLOGO_PROFILE_TYPE.DEVICE;
  }

  private initSubscribe() {
    this._subscriptions = [];

    const subs = [
      _.assign({}, FLOGO_SELECT_TRIGGER_SUB_EVENTS.triggerAction , { callback: this._onActionTrigger.bind(this) }),
      _.assign({}, FLOGO_TASK_SUB_EVENTS.changeTileDetail, { callback: this._changeTileDetail.bind(this) }),
      _.assign({}, FLOGO_TASK_SUB_EVENTS.triggerDetailsChanged, { callback: this._taskDetailsChanged.bind(this) })
    ];

    _.each(
      subs, sub => {
        this._subscriptions.push(this._postService.subscribe(sub));
      }
    );

    this._triggerMapperSubscription = this._triggerMapperService.save$
      .switchMap(({ trigger, mappings }) => this._restAPIHandlerService
        // Update the handler using the updateHandler REST API call
          .updateHandler(trigger.id, this.actionId, mappings)
          .then(handler => ({trigger, handler}))
      )
      .subscribe(({ trigger, handler }) => {
        const updatedHandler = _.assign({}, _.omit(handler, ['appId', 'triggerId']));
        const triggerToUpdate = this.triggers.find(t => t.id === trigger.id);
        triggerToUpdate.handlers = trigger.handlers.map(h => h.actionId === this.actionId ? updatedHandler : h);
        this.makeTriggersListForAction();
      });
  }

  private _taskDetailsChanged(data: any, envelope: any) {
    console.group('Save trigger details to flow');
    if (data.changedStructure === 'settings') {
      this._restAPITriggersService.updateTrigger(this.currentTrigger.id, {settings: data.settings});
    } else if (data.changedStructure === 'endpointSettings' || data.changedStructure === 'outputs') {
      this._restAPIHandlerService.updateHandler(this.currentTrigger.id, this.actionId, {
        settings: data.endpointSettings,
        outputs: data.outputs
      });

    }

    if (_.isFunction(envelope.done)) {
      envelope.done();
    }
    console.groupEnd();
  }

  private _changeTileDetail(data: {
    content: string;
    proper: string;
  }, envelope: any) {
    if (data.proper === 'name') {
      this._restAPITriggersService.updateTrigger(this.currentTrigger.id, {name: data.content});
    } else if (data.proper === 'description') {
      this._restAPITriggersService.updateTrigger(this.currentTrigger.id, {description: data.content});
    }

    if (_.isFunction(envelope.done)) {
      envelope.done();
    }
    console.groupEnd();
  }

  private makeTriggersListForAction() {
    this.triggersList = [];
    this.triggers.forEach(t => {
      const handlers = t.handlers.filter(a => a.actionId === this.actionId);
      handlers.forEach(h => {
        this.triggersList.push(_.assign({}, t, {handler: h}));
      });
    });
  }

  private manageAddTriggerInView() {
    this.allowMultipleTriggers = !(this.isDeviceType() && this.triggersList.length > 0);
  }

  openInstallTriggerWindow() {
    this.installTriggerActivated = true;
    this.closeAddTriggerModel(false);
  }

  onTriggerInstalledAction() {
    this.installTriggerActivated = false;
    this.openAddTriggerModel();
  }

  openAddTriggerModel() {
    this.showAddTrigger = true;
  }

  closeAddTriggerModel($event) {
    this.showAddTrigger = $event;
  }

  addTriggerToAction(data) {
    const settings = objectFromArray(data.triggerData.endpoint.settings, false);
    const outputs = objectFromArray(data.triggerData.outputs, false);
    let resultantPromiseState;
    let triggerId;
    if (data.installType === 'installed') {
      const appId = this.appDetails.appId;
      const triggerInfo: any = _.pick(data.triggerData, ['name', 'ref', 'description']);
      triggerInfo.settings = objectFromArray(data.triggerData.settings || [], false);

      resultantPromiseState = this._restAPITriggersService.createTrigger(appId, triggerInfo)
        .then( (triggerResult) => {
          triggerId = triggerResult.id;
          return this._restAPIHandlerService.updateHandler(triggerId, this.actionId, {settings, outputs});
        });
    } else {
      triggerId = data.triggerData.id;
      resultantPromiseState = this._restAPIHandlerService.updateHandler(triggerId, this.actionId, {settings, outputs});
    }
    resultantPromiseState.then(() => this._restAPITriggersService.getTrigger(triggerId))
      .then(trigger => {
        let existingTrigger = this.triggers.find(t => t.id === trigger.id);
        if (existingTrigger) {
          existingTrigger = trigger;
        } else {
          this.triggers.push(trigger);
        }
        this.makeTriggersListForAction();
        this.manageAddTriggerInView();
    });
  }

  showTriggerMenu(event, trigger) {
    this.selectedTriggerID = trigger.id;
    if (!this.isDeviceType()) {
      const parentTriggerBlock: Element = event.path.find(e => _.find(e.classList, (cls) => cls === 'trigger_block'));
      if (parentTriggerBlock) {
        this._clickHandler.setCurrentTriggerBlock(parentTriggerBlock);
      }
      this.displayTriggerMenuPopover = true;
    } else {
      this.showTriggerDetails(trigger);
    }
  }

  /*resetTriggerSelectState(triggerId) {
    this.selectedTriggerID = '';
  }*/

  handleClickOutsideTriggerMenu(event) {
    if (this._clickHandler.isClickedOutside(event.path)) {
      this._clickHandler.resetCurrentTriggerBlock();
      this.hideTriggerMenuPopover();
    }
  }

  private hideTriggerMenuPopover() {
    this.displayTriggerMenuPopover = false;
  }

  showTriggerDetails(trigger) {
    this.hideTriggerMenuPopover();
    this.currentTrigger = _.cloneDeep(trigger);
    this._router.navigate(['/flows', this.actionId, 'trigger', trigger.id])
      .then(() => this._converterService.getTriggerTask(trigger))
      .then((triggerForUI) => {
        const dataToPublish = {
          'id': 'root',
          'task': triggerForUI,
          'context': {
            'isTrigger': true,
            'isBranch': false,
            'isTask': false,
            'hasProcess': false,
            'isDiagramEdited': false,
            'currentTrigger': trigger,
            'profileType': this.appDetails.appProfileType
          }
        };
        this._postService.publish(
          _.assign(
            {}, FLOGO_SELECT_TRIGGER_PUB_EVENTS.selectTrigger, {
              data: _.assign({}, dataToPublish)
            }
          )
        );
      });
  }

  openTriggerMapper(trigger: IFlogoTrigger & {handler: any}) {
    this.hideTriggerMenuPopover();
    const handler = trigger.handler;
    this._converterService.getTriggerTask(trigger)
      .then(triggerSchema => this._triggerMapperService.open(trigger, this.appDetails.metadata, handler, triggerSchema));
  }

  deleteHandlerForTrigger(triggerId) {
    this.hideTriggerMenuPopover();
    this._restAPIHandlerService.deleteHandler(this.actionId, triggerId)
      .then(() => this._router.navigate(['/flows', this.actionId]))
      .then(() => this._restAPITriggersService.getTrigger(triggerId))
      .then(trigger => {
        const hasHandlerForThisAction = !!trigger.handlers.find(h => h.actionId === this.actionId);
        if (hasHandlerForThisAction) {
          this.triggers = this.triggers.map(t => t.id === triggerId ? trigger : t);
        } else {
          this.triggers = this.triggers.filter(t => t.id !== triggerId);
        }
        this.makeTriggersListForAction();
      });
  }

  private _onActionTrigger(data: any, envelope: any) {
    if (data.action === 'trigger-copy') {
      this._restAPIHandlerService.deleteHandler(this.actionId, this.currentTrigger.id)
        .then(() => {
          const triggerSettings = _.pick(this.currentTrigger, [
            'name',
            'description',
            'ref',
            'settings'
          ]);
          return this._restAPITriggersService.createTrigger(this.appDetails.appId, triggerSettings);
        })
        .then((createdTrigger) => {
          const settings = this.getSettingsCurrentHandler();
          this.currentTrigger = createdTrigger;
          return this._restAPIHandlerService.updateHandler(createdTrigger.id, this.actionId, settings);
        })
        .then((updatedHandler) => {
          const message = this.translate.instant('CANVAS:COPIED-TRIGGER');
          notification(message, 'success', 3000);
          const updatedTriggerDetails = _.assign({}, this.currentTrigger);
          const currentHandler = _.assign({}, _.pick(updatedHandler, [
            'actionId',
            'createdAt',
            'outputs',
            'settings',
            'updatedAt'
          ]));
          updatedTriggerDetails.handlers.push(currentHandler);
          updatedTriggerDetails.handler = currentHandler;
          this.showTriggerDetails(updatedTriggerDetails);
        });
    }
  }

  private getSettingsCurrentHandler() {
    const settings = _.cloneDeep(this.currentTrigger.handler.settings);
    const outputs = _.cloneDeep(this.currentTrigger.handler.outputs);

    return {settings, outputs};
  }
}
