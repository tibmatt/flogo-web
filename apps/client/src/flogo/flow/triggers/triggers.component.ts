import { pick, uniq } from 'lodash';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { takeUntil, mergeMap, reduce } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';

import { LanguageService, FlowMetadata, TriggerSchema, Dictionary } from '@flogo-web/client/core';
import { TriggersApiService } from '@flogo-web/client/core/services';
import { FLOGO_PROFILE_TYPE, TRIGGER_MENU_OPERATION } from '@flogo-web/client/core/constants';
import { objectFromArray } from '@flogo-web/client/shared/utils';
import { RESTAPIHandlersService } from '@flogo-web/client/core/services/restapi/v2/handlers-api.service';

import { SingleEmissionSubject } from '@flogo-web/client/core/models/single-emission-subject';
import { UIModelConverterService } from '@flogo-web/client/flow/core/ui-model-converter.service';

import { AppState } from '../core/state/app.state';

import { Trigger } from '../core';
import { TriggerMenuSelectionEvent } from '@flogo-web/client/flow/triggers/trigger-block/models';
import { RenderableTrigger } from './interfaces/renderable-trigger';
import { getTriggersState } from '../core/state/triggers/triggers.selectors';
import * as TriggerActions from '../core/state/triggers/triggers.actions';
import * as TriggerConfigureActions from '../core/state/triggers-configure/trigger-configure.actions';

@Component({
  selector: 'flogo-flow-triggers',
  templateUrl: 'triggers.component.html',
  styleUrls: ['triggers.component.less'],
})
export class FlogoFlowTriggersPanelComponent implements OnInit, OnDestroy {
  actionId: string;
  appDetails: { appId: string; appProfileType: FLOGO_PROFILE_TYPE; metadata?: FlowMetadata };
  triggersList: RenderableTrigger[] = [];
  allowMultipleTriggers = true;
  currentTrigger: RenderableTrigger;
  showAddTrigger = false;
  installTriggerActivated = false;

  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(
    private restAPITriggersService: TriggersApiService,
    private _restAPIHandlerService: RESTAPIHandlersService,
    private _converterService: UIModelConverterService,
    private _router: Router,
    private _translate: LanguageService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.store
      .pipe(
        select(getTriggersState),
        takeUntil(this.ngDestroy$)
      )
      .subscribe(triggerState => {
        this.currentTrigger = triggerState.currentTrigger;
        this.actionId = triggerState.actionId;
        this.triggersList = triggerState.triggers;
        // todo: possibly flatten this structure out but some sub components depend on it right now
        this.appDetails = {
          appId: triggerState.appId,
          appProfileType: triggerState.appProfileType,
          metadata: triggerState.flowMetadata,
        };
        // todo: modifies computed values based on state, it could be a selector instead
        this.manageAddTriggerInView();
      });
  }

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }

  get isDeviceType() {
    return this.appDetails.appProfileType === FLOGO_PROFILE_TYPE.DEVICE;
  }

  trackTriggerBy(index: number, trigger: RenderableTrigger) {
    return trigger.id;
  }

  private manageAddTriggerInView() {
    this.allowMultipleTriggers = !(this.isDeviceType && this.triggersList.length > 0);
  }

  openInstallTriggerWindow() {
    this.installTriggerActivated = true;
    this.closeAddTriggerModal(false);
  }

  onTriggerInstalledAction() {
    this.installTriggerActivated = false;
    this.openAddTriggerModal();
  }

  openAddTriggerModal() {
    this.showAddTrigger = true;
  }

  closeAddTriggerModal(showAddTrigger: boolean) {
    this.showAddTrigger = showAddTrigger;
  }

  addTriggerToAction(data) {
    const settings = objectFromArray(data.triggerData.handler.settings, true);
    const outputs = objectFromArray(data.triggerData.outputs, true);
    this.persistNewTriggerAndHandler(data, settings, outputs)
      .then(triggerId => this.restAPITriggersService.getTrigger(triggerId))
      .then(trigger => {
        const handler = trigger.handlers.find(h => h.actionId === this.actionId);
        this.store.dispatch(new TriggerActions.AddTrigger({ trigger, handler }));
      });
  }

  private persistNewTriggerAndHandler(data, settings, outputs) {
    let registerTrigger;
    if (data.installType === 'installed') {
      const appId = this.appDetails.appId;
      const triggerInfo: any = pick(data.triggerData, ['name', 'ref', 'description']);
      triggerInfo.settings = objectFromArray(data.triggerData.settings || [], false);
      registerTrigger = this.restAPITriggersService
        .createTrigger(appId, triggerInfo)
        .then(triggerResult => triggerResult.id);
    } else {
      registerTrigger = Promise.resolve(data.triggerData.id);
    }
    return registerTrigger.then(triggerId => {
      return this._restAPIHandlerService
        .updateHandler(triggerId, this.actionId, { settings, outputs })
        .then(() => triggerId);
    });
  }

  private openTriggerMapper(selectedTrigger: Trigger) {
    const refs = uniq(this.triggersList.map(trigger => trigger.ref));
    from(refs)
      .pipe(
        mergeMap(ref => this._converterService.getTriggerSchema(ref)),
        reduce((schemas: Dictionary<TriggerSchema>, schema: TriggerSchema) => {
          return { ...schemas, [schema.ref]: schema };
        }, {})
      )
      .subscribe(triggerSchemas => {
        this.store.dispatch(
          new TriggerConfigureActions.OpenConfigureWithSelection({
            triggerId: selectedTrigger.id,
            triggerSchemas,
          })
        );
      });
  }

  private deleteHandlerForTrigger(triggerId) {
    this._restAPIHandlerService
      .deleteHandler(this.actionId, triggerId)
      .then(() => this._router.navigate(['/flows', this.actionId]))
      .then(() => this.store.dispatch(new TriggerActions.RemoveHandler(triggerId)));
  }

  handleMenuSelection(event: TriggerMenuSelectionEvent) {
    switch (event.operation) {
      case TRIGGER_MENU_OPERATION.SHOW_SETTINGS:
        this.openTriggerMapper(event.trigger);
        break;
      case TRIGGER_MENU_OPERATION.DELETE:
        this.deleteHandlerForTrigger(event.trigger.id);
        break;
      default:
        console.warn(`[TRIGGER MENU][${event.operation}] unhandled menu action.`);
        break;
    }
  }
}
