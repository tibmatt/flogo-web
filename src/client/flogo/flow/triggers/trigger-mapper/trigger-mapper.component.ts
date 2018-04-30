import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BsModalComponent } from 'ng2-bs3-modal';

import { SingleEmissionSubject } from '@flogo/core/models/single-emission-subject';
import 'rxjs/add/operator/takeUntil';

import { IMapping, IMapExpression, MapperTranslator, MappingsValidatorFn, StaticMapperContextFactory } from '../../shared/mapper';
import { FlowMetadata } from '@flogo/core/interfaces/flow';

import { TriggerMapperService, Status } from './trigger-mapper.service';
import {TAB_NAME, Tabs} from '@flogo/flow/task-configurator/models/tabs.model';


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

  currentViewName: TAB_NAME;
  tabs: Tabs;
  private editingMappings: {
    actionInput: { [key: string]: IMapExpression };
    actionOutput: { [key: string]: IMapExpression };
  };

  defaultTabsInfo: { name: TAB_NAME, labelKey: string }[] = [
    {name: 'flowInput', labelKey: 'TRIGGER-MAPPER:FLOW-INPUTS'},
    {name: 'flowOutput', labelKey: 'TRIGGER-MAPPER:FLOW-OUTPUTS'}
  ];

  private ngDestroy = SingleEmissionSubject.create();

  constructor(private triggerMapperService: TriggerMapperService) {
    this.tabs = Tabs.create(this.defaultTabsInfo);
  }

  ngOnInit() {
    this.triggerMapperService.status$
      .takeUntil(this.ngDestroy)
      .subscribe(nextStatus => this.onNextStatus(nextStatus));
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
    if (currentView === this.tabs.get('flowInput')) {
      this.editingMappings.actionInput = mappings;
    } else if (currentView === this.tabs.get('flowOutput')) {
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

  setCurrentView(viewName: TAB_NAME) {
    this.tabs.markSelected(viewName);
    this.currentViewName = viewName;
    if (viewName === 'flowInput') {
      this.setupInputsContext();
      this.tabs.get('flowInput').inputsLabelKey = 'TRIGGER-MAPPER:LABEL-FLOW-INPUTS';
      this.tabs.get('flowInput').outputsLabelKey = 'TRIGGER-MAPPER:LABEL-TRIGGER-OUTPUT';
    } else if (viewName === 'flowOutput') {
      this.tabs.get('flowOutput').inputsLabelKey = 'TRIGGER-MAPPER:LABEL-TRIGGER-REPLY-ATTRIBUTES';
      this.tabs.get('flowOutput').outputsLabelKey = 'TRIGGER-MAPPER:LABEL-FLOW-OUTPUTS';
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
    this.tabs.get('flowInput').enabled = hasTriggerOutputs && hasFlowInputs;
    this.tabs.get('flowOutput').enabled = hasTriggerReply && hasFlowOutputs;
    let viewType: TAB_NAME = 'flowInput';
    if (this.tabs.get('flowOutput').isSelected) {
      viewType = 'flowInput';
    } else if (this.tabs.get('flowOutput').isSelected) {
      viewType = 'flowOutput';
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

}
