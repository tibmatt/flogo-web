import {Component, Input, OnChanges} from '@angular/core';

import { IMapping, IMapExpression, MapperTranslator, MappingsValidatorFn, StaticMapperContextFactory } from '../../../shared/mapper';
import { FlowMetadata } from '@flogo/core/interfaces/flow';

import {Tabs} from '@flogo/flow/shared/tabs/models/tabs.model';
import {ConfiguratorService} from '../configurator.service';
import {HandlerMappings} from '../configurator.service';

const TRIGGER_TABS = {
  MAP_FLOW_INPUT: 'mapFlowInput',
  MAP_FLOW_OUTPUT: 'mapFlowOutput'
};

@Component({
  selector: 'flogo-flow-trigger-mapper',
  styleUrls: [
    'trigger-mapper.component.less'
  ],
  templateUrl: 'trigger-mapper.component.html'
})
export class TriggerMapperComponent implements OnChanges {

  mapperContext: any;
  mappingValidationFn: MappingsValidatorFn;

  @Input()
  flowMetadata: FlowMetadata;
  @Input()
  triggerSchema: any;
  @Input()
  handler: any;
  @Input()
  triggerId: string;
  @Input()
  changedMappings: HandlerMappings;

  currentViewName: string;
  tabs: Tabs;
  private editingMappings: {
    actionInput: { [key: string]: IMapExpression };
    actionOutput: { [key: string]: IMapExpression };
  };

  defaultTabsInfo: { name: string, labelKey: string }[] = [
    {name: TRIGGER_TABS.MAP_FLOW_INPUT, labelKey: 'TRIGGER-CONFIGURATOR:FLOW-INPUTS'},
    {name: TRIGGER_TABS.MAP_FLOW_OUTPUT, labelKey: 'TRIGGER-CONFIGURATOR:FLOW-OUTPUTS'}
  ];

  constructor(private triggerConfiguratorService: ConfiguratorService) {
  }

  ngOnChanges() {
    this.onNextStatus();
  }

  onMappingsChange(change: IMapping) {
    const mappings = _.cloneDeep(change).mappings;
    const currentView = this.currentViewStatus;
    if (currentView === this.tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT)) {
      this.editingMappings.actionInput = mappings;
    } else if (currentView === this.tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT)) {
      this.editingMappings.actionOutput = mappings;
    } else {
      return;
    }
    currentView.isValid = this.mappingValidationFn({ mappings });
    this.updateCurrentTriggerStatus();
  }

  setCurrentView(viewName: string) {
    if (this.tabs.get(viewName).enabled) {
      this.tabs.markSelected(viewName);
    }
    this.currentViewName = viewName;
    if (viewName === TRIGGER_TABS.MAP_FLOW_INPUT) {
      this.setupInputsContext();
      this.tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).inputsLabelKey = 'TRIGGER-MAPPER:LABEL-FLOW-INPUTS';
      this.tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).outputsLabelKey = 'TRIGGER-MAPPER:LABEL-TRIGGER-OUTPUT';
    } else if (viewName === TRIGGER_TABS.MAP_FLOW_OUTPUT) {
      this.tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).inputsLabelKey = 'TRIGGER-MAPPER:LABEL-TRIGGER-REPLY-ATTRIBUTES';
      this.tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).outputsLabelKey = 'TRIGGER-MAPPER:LABEL-FLOW-OUTPUTS';
      this.setupReplyContext();
    }
  }

  updateCurrentTriggerStatus() {
    const changedMappings = {
      actionMappings: {
        input: MapperTranslator.translateMappingsOut(this.editingMappings.actionInput),
        output: MapperTranslator.translateMappingsOut(this.editingMappings.actionOutput)
      }
    };
    this.triggerConfiguratorService.updateTriggerStatus({
      triggerId: this.triggerId,
      isValid: this.tabs.areValid(), // If we do not find an invalid viewStates means the trigger tab is valid
      changedMappings
    });
  }

  get currentViewStatus() {
    return this.tabs.get(this.currentViewName);
  }

  private onNextStatus() {
    const { actionMappings } = this.changedMappings || this.handler;
    const { input, output } = actionMappings;
    this.editingMappings = {
      actionInput: MapperTranslator.translateMappingsIn(input),
      actionOutput: MapperTranslator.translateMappingsIn(output)
    };
    const triggerSchema = this.triggerSchema;
    const flowMetadata = this.flowMetadata;
    this.setupViews(triggerSchema, flowMetadata);
  }

  trackTabsByFn(index, [tabName, tab]) {
    return tabName;
  }

  private setupViews(triggerSchema: any, flowMetadata: FlowMetadata) {
    let hasTriggerOutputs = false;
    let hasTriggerReply = false;
    let hasFlowInputs = false;
    let hasFlowOutputs = false;

    if (triggerSchema) {
      hasTriggerOutputs = triggerSchema.outputs && triggerSchema.outputs.length > 0;
      hasTriggerReply = triggerSchema.reply && triggerSchema.reply.length > 0;
    }

    if (flowMetadata) {
      hasFlowInputs = flowMetadata.input && flowMetadata.input.length > 0;
      hasFlowOutputs = flowMetadata.output && flowMetadata.output.length > 0;
    }
    this.resetState();
    this.tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).enabled = hasTriggerOutputs && hasFlowInputs;
    this.tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).enabled = hasTriggerReply && hasFlowOutputs;
    let viewType: string = TRIGGER_TABS.MAP_FLOW_INPUT;
    if (this.tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).isSelected || this.tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).enabled ) {
      viewType = TRIGGER_TABS.MAP_FLOW_INPUT;
    } else if (this.tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).isSelected || this.tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).enabled) {
      viewType = TRIGGER_TABS.MAP_FLOW_OUTPUT;
    }
    this.setCurrentView(viewType);
  }

  private setupInputsContext() {
    const flowMetadata = this.flowMetadata || { input: [] };
    const flowInputSchema = MapperTranslator.attributesToObjectDescriptor(flowMetadata.input);
    const triggerOutputSchema = MapperTranslator.attributesToObjectDescriptor(this.triggerSchema.outputs || []);
    const mappings = _.cloneDeep(this.editingMappings.actionInput);

    this.mapperContext = StaticMapperContextFactory.create(flowInputSchema, triggerOutputSchema, mappings);
    this.mappingValidationFn = MapperTranslator.makeValidator();
  }

  private setupReplyContext() {
    const triggerReplySchema = MapperTranslator.attributesToObjectDescriptor(this.triggerSchema.reply || []);
    const flowMetadata = this.flowMetadata || { output: [] };
    const flowOutputSchema = MapperTranslator.attributesToObjectDescriptor(flowMetadata.output);
    const mappings = _.cloneDeep(this.editingMappings.actionOutput);

    this.mapperContext = StaticMapperContextFactory.create(triggerReplySchema, flowOutputSchema, mappings);
    this.mappingValidationFn = MapperTranslator.makeValidator();
  }

  resetState() {
    if (this.tabs) {
      this.tabs.clear();
    }
    this.tabs = Tabs.create(this.defaultTabsInfo);
  }
}
