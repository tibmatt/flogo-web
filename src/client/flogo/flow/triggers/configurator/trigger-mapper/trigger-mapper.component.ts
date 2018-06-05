import {Component, OnDestroy, OnInit} from '@angular/core';

import { IMapping, IMapExpression, MapperTranslator, StaticMapperContextFactory } from '../../../shared/mapper';

import {ConfiguratorService as TriggerConfiguratorService} from '../configurator.service';
import {MapperStatus} from '../interfaces';
import {SingleEmissionSubject} from '@flogo/core/models/single-emission-subject';
import {TRIGGER_TABS} from '../core/constants';

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
  private editingMappings: {
    actionInput: { [key: string]: IMapExpression };
    actionOutput: { [key: string]: IMapExpression };
  };
  private ngDestroy = SingleEmissionSubject.create();

  constructor(private triggerConfiguratorService: TriggerConfiguratorService) {
  }

  ngOnInit() {
    this.triggerConfiguratorService.triggerMapperStatus$
      .takeUntil(this.ngDestroy)
      .subscribe((nextStatus: MapperStatus) => this.onNextStatus(nextStatus));
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();
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
    this.setCurrentView(viewType);
  }

  setCurrentView(viewName: string) {

    if (this.triggerTabs && this.triggerTabs.get(viewName).enabled) {
      this.triggerTabs.markSelected(viewName);
    }
    this.currentViewName = viewName;
    if (viewName === TRIGGER_TABS.MAP_FLOW_INPUT) {
      this.setupInputsContext();
    } else if (viewName === TRIGGER_TABS.MAP_FLOW_OUTPUT) {
      this.setupReplyContext();
    }
  }

  onMappingsChange(change: IMapping) {
    const mappings = _.cloneDeep(change).mappings;
    const currentView = this.currentViewStatus;
    if (currentView === this.triggerTabs.get(TRIGGER_TABS.MAP_FLOW_INPUT)) {
      this.editingMappings.actionInput = mappings;
    } else if (currentView === this.triggerTabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT)) {
      this.editingMappings.actionOutput = mappings;
    } else {
      return;
    }
    currentView.isValid = this.triggerConfiguratorService.areValidMappings({ mappings });
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

  trackTabsByFn(index, [tabName, tab]) {
    return tabName;
  }

  private setupInputsContext() {
    const flowMetadata = this.currentMapperState.flowMetadata || { input: [] };
    const flowInputSchema = MapperTranslator.attributesToObjectDescriptor(flowMetadata.input);
    const triggerSchema = this.currentMapperState.triggerSchema || {outputs: []};
    const triggerOutputSchema = MapperTranslator.attributesToObjectDescriptor(triggerSchema.outputs);
    const mappings = _.cloneDeep(this.editingMappings.actionInput);

    this.mapperContext = StaticMapperContextFactory.create(flowInputSchema, triggerOutputSchema, mappings);
  }

  private setupReplyContext() {
    const triggerSchema = this.currentMapperState.triggerSchema || {reply: []};
    const triggerReplySchema = MapperTranslator.attributesToObjectDescriptor( triggerSchema.reply );
    const flowMetadata = this.currentMapperState.flowMetadata || { output: [] };
    const flowOutputSchema = MapperTranslator.attributesToObjectDescriptor(flowMetadata.output);
    const mappings = _.cloneDeep(this.editingMappings.actionOutput);

    this.mapperContext = StaticMapperContextFactory.create(triggerReplySchema, flowOutputSchema, mappings);
  }
}
