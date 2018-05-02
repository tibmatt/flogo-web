import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BsModalComponent } from 'ng2-bs3-modal';

import { SingleEmissionSubject } from '@flogo/core/models/single-emission-subject';
import 'rxjs/add/operator/takeUntil';

import { IMapping, IMapExpression, MapperTranslator, MappingsValidatorFn, StaticMapperContextFactory } from '../../shared/mapper';
import { FlowMetadata } from '@flogo/core/interfaces/flow';

import { TriggerMapperService, Status } from './trigger-mapper.service';
import {Tabs} from '@flogo/flow/shared/tabs/models/tabs.model';

const TRIGGER_TABS = {
  MAP_FLOW_INPUT: 'mapFlowInput',
  MAP_FLOW_OUTPUT: 'mapFlowOutput'
};

@Component({
  selector: 'flogo-flow-trigger-mapper',
  styleUrls: [
    '../../../../assets/_mapper-modal.less',
    'trigger-mapper.component.less'
  ],
  templateUrl: 'trigger-mapper.component.html'
})
export class TriggerMapperComponent implements OnInit, OnDestroy {

  @ViewChild(BsModalComponent) modal: BsModalComponent;

  mapperContext: any;
  mappingValidationFn: MappingsValidatorFn;
  currentStatus: Status = {isOpen: false, flowMetadata: null, triggerSchema: null, handler: null, trigger: null};

  currentViewName: string;
  tabs: Tabs;
  private editingMappings: {
    actionInput: { [key: string]: IMapExpression };
    actionOutput: { [key: string]: IMapExpression };
  };

  defaultTabsInfo: { name: string, labelKey: string }[] = [
    {name: TRIGGER_TABS.MAP_FLOW_INPUT, labelKey: 'TRIGGER-MAPPER:FLOW-INPUTS'},
    {name: TRIGGER_TABS.MAP_FLOW_OUTPUT, labelKey: 'TRIGGER-MAPPER:FLOW-OUTPUTS'}
  ];

  private ngDestroy = SingleEmissionSubject.create();

  constructor(private triggerMapperService: TriggerMapperService) {



  }

  ngOnInit() {
    this.triggerMapperService.status$
      .takeUntil(this.ngDestroy)
      .subscribe(nextStatus => this.onNextStatus(nextStatus));
    this.resetState();
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();

  }

  onCloseOrDismiss() {
    this.triggerMapperService.close();
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
    currentView.isValid = this.mappingValidationFn({mappings});
    currentView.isDirty = true;
  }

  onSave() {
    this.triggerMapperService.save(this.currentStatus.trigger, {
      actionMappings: {
        input: MapperTranslator.translateMappingsOut(this.editingMappings.actionInput),
        output: MapperTranslator.translateMappingsOut(this.editingMappings.actionOutput),
      },
    });
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


  get currentViewStatus() {
    return this.tabs.get(this.currentViewName);
  }

  private onNextStatus(nextStatus: Status) {
    this.currentStatus = Object.assign({}, nextStatus);
    if (nextStatus.isOpen) {
      const {actionMappings} = nextStatus.handler;
      const {input, output} = actionMappings;
      this.editingMappings = {
        actionInput: MapperTranslator.translateMappingsIn(input),
        actionOutput: MapperTranslator.translateMappingsIn(output)
      };
      const triggerSchema = nextStatus.triggerSchema;
      const flowMetadata = nextStatus.flowMetadata;
      this.setupViews(triggerSchema, flowMetadata);

      this.modal.open().then(() => {
        // todo: remove
        // dirty hack for the mapper editor to setup the size correctly after the modal finishes its animation
        // probably move inside the mapper module
        const event = document.createEvent('HTMLEvents');
        event.initEvent('resize', true, false);
        document.dispatchEvent(event);
      });
    } else if (this.modal.visible) {
      this.mapperContext = null;
      this.editingMappings = null;
      this.modal.close();
    }
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
    const flowMetadata = this.currentStatus.flowMetadata || {input: []};
    const flowInputSchema = MapperTranslator.attributesToObjectDescriptor(flowMetadata.input);
    const triggerOutputSchema = MapperTranslator.attributesToObjectDescriptor(this.currentStatus.triggerSchema.outputs || []);
    const mappings = _.cloneDeep(this.editingMappings.actionInput);

    this.mapperContext = StaticMapperContextFactory.create(flowInputSchema, triggerOutputSchema, mappings);
    this.mappingValidationFn = MapperTranslator.makeValidator();
  }

  private setupReplyContext() {
    const triggerReplySchema = MapperTranslator.attributesToObjectDescriptor(this.currentStatus.triggerSchema.reply || []);
    const flowMetadata = this.currentStatus.flowMetadata || {output: []};
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
