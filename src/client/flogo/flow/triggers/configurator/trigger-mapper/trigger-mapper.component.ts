import { cloneDeep } from 'lodash';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import {SingleEmissionSubject} from '@flogo/core/models/single-emission-subject';
import { FlowState } from '../../../core/state';
import {
  getCurrentTabType,
  getHasTriggersConfigure,
  getAllTabs,
  getCurrentTabs
} from '../../../core/state/triggers-configure/trigger-configure.selectors';
import * as TriggerConfigureActions from '../../../core/state/triggers-configure/trigger-configure.actions';
import { TriggerConfigureTabType, TriggerConfigureTab } from '../../../core/interfaces';
import { Mappings, MapExpression, MapperTranslator, StaticMapperContextFactory } from '../../../shared/mapper';
import {ConfiguratorService as TriggerConfiguratorService} from '../configurator.service';
import { MapperStatus } from '../interfaces';
import { TRIGGER_TABS } from '../core/constants';

@Component({
  selector: 'flogo-flow-trigger-mapper',
  styleUrls: [
    'trigger-mapper.component.less'
  ],
  templateUrl: 'trigger-mapper.component.html'
})
export class TriggerMapperComponent implements OnInit, OnDestroy {

  currentMapperState: MapperStatus = {
    flowMetadata: null,
    handler: null,
    triggerSchema: null,
    tabs: null
  };
  mapperContext: any;
  currentViewName: string;

  currentTabType: TriggerConfigureTabType;
  tabs$: Observable<TriggerConfigureTab[]>;

  private editingMappings: {
    actionInput: { [key: string]: MapExpression };
    actionOutput: { [key: string]: MapExpression };
  };
  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(private triggerConfiguratorService: TriggerConfiguratorService, private store: Store<FlowState>) {
  }

  ngOnInit() {
    this.triggerConfiguratorService.triggerMapperStatus$
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((nextStatus: MapperStatus) => this.onNextStatus(nextStatus));

    const selectTabs$ = this.store.select(getCurrentTabs);
    this.tabs$ = this.store.select(getHasTriggersConfigure)
      .pipe(
        switchMap((isInitialized) => isInitialized ? selectTabs$ : of([])),
      );
    this.store
      .select(getCurrentTabType)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(currentTabType => this.currentTabType = currentTabType);
  }

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }

  onNextStatus(nextStatus: MapperStatus) {
    this.currentMapperState = {
      ...this.currentMapperState,
      ...nextStatus
    };
    this.adaptMapperStateChanges();
  }

  adaptMapperStateChanges() {
    const {actionMappings} = this.currentMapperState.changedMappings || this.currentMapperState.handler || {
      actionMappings: {
        input: null,
        output: null
      }
    };
    const { input, output } = actionMappings;
    this.editingMappings = {
      actionInput: MapperTranslator.translateMappingsIn(input),
      actionOutput: MapperTranslator.translateMappingsIn(output)
    };
    let viewType: string = TRIGGER_TABS.MAP_FLOW_INPUT;
    const tabs = this.triggerTabs;
    if (tabs) {
      if (tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).isSelected
        || tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).enabled ) {
        viewType = TRIGGER_TABS.MAP_FLOW_INPUT;
      } else if (tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).isSelected
        || tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).enabled) {
        viewType = TRIGGER_TABS.MAP_FLOW_OUTPUT;
      }
    }
    // this.setCurrentView(viewType);
  }

  setCurrentView(viewName: TriggerConfigureTabType) {
    this.store.dispatch(new TriggerConfigureActions.SelectTab(viewName));
    // if (this.triggerTabs && this.triggerTabs.get(viewName).enabled) {
    //   this.triggerTabs.markSelected(viewName);
    // }
    // this.currentViewName = viewName;
    // if (viewName === TRIGGER_TABS.MAP_FLOW_INPUT) {
    //   this.setupInputsContext();
    // } else if (viewName === TRIGGER_TABS.MAP_FLOW_OUTPUT) {
    //   this.setupReplyContext();
    // }
  }

  onMappingsChange(newMappings: Mappings) {
    const mappings = cloneDeep(newMappings);
    const currentView = this.currentViewStatus;
    if (currentView === this.triggerTabs.get(TRIGGER_TABS.MAP_FLOW_INPUT)) {
      this.editingMappings.actionInput = mappings;
    } else if (currentView === this.triggerTabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT)) {
      this.editingMappings.actionOutput = mappings;
    } else {
      return;
    }
    currentView.isValid = this.triggerConfiguratorService.areValidMappings(mappings);
    this.updateCurrentTriggerStatus();
  }

  updateCurrentTriggerStatus() {
    const changedMappings = {
      actionMappings: {
        input: MapperTranslator.translateMappingsOut(this.editingMappings.actionInput),
        output: MapperTranslator.translateMappingsOut(this.editingMappings.actionOutput)
      }
    };
    this.triggerConfiguratorService.updateTriggerConfiguration({
      isValid: this.triggerTabs.areValid(), // If we do not find an invalid viewStates means the trigger tab is valid
      changedMappings
    });
  }

  get triggerTabs() {
    return this.currentMapperState.tabs;
  }

  get currentViewStatus() {
    return this.currentMapperState.tabs && this.currentMapperState.tabs.get(this.currentViewName);
  }

  trackTabsByFn(index, tab) {
    return tab.id;
  }

  private setupInputsContext() {
    const flowMetadata = this.currentMapperState.flowMetadata || { input: [] };
    const flowInputSchema = MapperTranslator.attributesToObjectDescriptor(flowMetadata.input);
    const triggerSchema = this.currentMapperState.triggerSchema || {outputs: []};
    const triggerOutputSchema = MapperTranslator.attributesToObjectDescriptor(triggerSchema.outputs);
    const mappings = cloneDeep(this.editingMappings.actionInput);

    this.mapperContext = StaticMapperContextFactory.create(flowInputSchema, triggerOutputSchema, mappings);
  }

  private setupReplyContext() {
    const triggerSchema = this.currentMapperState.triggerSchema || {reply: []};
    const triggerReplySchema = MapperTranslator.attributesToObjectDescriptor( triggerSchema.reply );
    const flowMetadata = this.currentMapperState.flowMetadata || { output: [] };
    const flowOutputSchema = MapperTranslator.attributesToObjectDescriptor(flowMetadata.output);
    const mappings = cloneDeep(this.editingMappings.actionOutput);

    this.mapperContext = StaticMapperContextFactory.create(triggerReplySchema, flowOutputSchema, mappings);
  }
}
