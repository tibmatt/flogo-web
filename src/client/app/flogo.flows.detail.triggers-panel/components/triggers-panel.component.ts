import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FLOGO_PROFILE_TYPE} from '../../../common/constants';
import {objectFromArray} from '../../../common/utils';
import {RESTAPITriggersService} from '../../../common/services/restapi/v2/triggers-api.service';
import {RESTAPIHandlersService} from '../../../common/services/restapi/v2/handlers-api.service';

export interface IFlogoTriggers {
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
export class FlogoFlowTriggersPanelComponent implements OnChanges {
  @Input()
  triggers: IFlogoTriggers[];
  @Input()
  actionId: string;
  @Input()
  appDetails: {appId: string, appProfileType:  FLOGO_PROFILE_TYPE};
  triggersList: any[] = [];
  allowMultipleTriggers = true;
  public showAddTrigger = false;

  constructor(private _restAPITriggersService: RESTAPITriggersService,
              private _restAPIHandlerService: RESTAPIHandlersService) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['triggers']) {
      this.makeTriggersListForAction();
      this.manageAddTriggerInView();
    }
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
    if (this.appDetails.appProfileType === FLOGO_PROFILE_TYPE.DEVICE && this.triggersList.length > 0) {
      this.allowMultipleTriggers = false;
    } else {
      this.allowMultipleTriggers = true;
    }
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
    });
  }
}
