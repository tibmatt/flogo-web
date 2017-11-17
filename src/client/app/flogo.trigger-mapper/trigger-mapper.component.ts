import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import { SingleEmissionSubject } from '../../common/models/single-emission-subject';
import 'rxjs/add/operator/takeUntil';

import { IMapping, IMapExpression, MapperTranslator, StaticMapperContextFactory } from '../flogo.mapper';
import { FlowMetadata } from '../flogo.flows.detail/models';

import { VIEWS } from './views-info.model';
import { TriggerMapperService, Status } from './trigger-mapper.service';

@Component({
  selector: 'flogo-trigger-mapper',
  styleUrls: [
    '../../common/styles/_mapper-modal.less',
    'trigger-mapper.component.less'
  ],
  templateUrl: 'trigger-mapper.component.html'
})
export class TriggerMapperComponent implements OnInit, OnDestroy {
  // allow access to the constants from the template
  VIEWS = VIEWS;
  @ViewChild(ModalComponent) modal: ModalComponent;

  mapperContext: any;
  currentStatus: Status = { isOpen: false, flowMetadata: null, triggerSchema: null, handler: null, trigger: null };

  currentView = {
    name: '',
    inputsLabelKey: '',
    outputsLabelKey: '',
  };
  isInputsViewEnabled: boolean;
  isReplyViewEnabled: boolean;

  private editingMappings: {
    actionInput: { [key: string]: IMapExpression };
    actionOutput: { [key: string]: IMapExpression };
  };
  private ngDestroy = SingleEmissionSubject.create();

  constructor(private triggerMapperService: TriggerMapperService) {
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
    if (this.currentView.name === this.VIEWS.INPUTS.name) {
      this.editingMappings.actionInput = mappings;
    } else if (this.currentView.name === this.VIEWS.REPLY.name) {
      this.editingMappings.actionOutput = mappings;
    }
  }

  onSave() {
    this.triggerMapperService.save(this.currentStatus.trigger, {
      actionMappings: {
        input: MapperTranslator.translateMappingsOut(this.editingMappings.actionInput, []),
        output: MapperTranslator.translateMappingsOut(this.editingMappings.actionOutput, []),
      },
    });
  }

  setView(viewName: string) {
    let viewInfo;
    let mapperContext;
    if (viewName === VIEWS.INPUTS.name) {
      mapperContext = this.createInputsContext();
      viewInfo = this.VIEWS.INPUTS;
    } else if (viewName === VIEWS.REPLY.name) {
      mapperContext = this.createReplyContext();
      viewInfo = this.VIEWS.REPLY;
    }
    this.mapperContext = mapperContext;
    this.currentView = viewInfo;
  }

  private onNextStatus(nextStatus: Status) {
    this.currentStatus = Object.assign({}, nextStatus);
    if (nextStatus.isOpen) {
      const { actionMappings } = nextStatus.handler;
      const { input, output } = actionMappings;
      this.editingMappings = {
        actionInput: MapperTranslator.translateMappingsIn(input),
        actionOutput: MapperTranslator.translateMappingsIn(output),
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
      this.modal.close();
    }
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

    this.isInputsViewEnabled = hasTriggerOutputs && hasFlowInputs;
    this.isReplyViewEnabled = hasTriggerReply && hasFlowOutputs;

    let viewType: string = this.VIEWS.INPUTS.name;
    if (this.isInputsViewEnabled) {
      viewType = this.VIEWS.INPUTS.name;
    } else if (this.isReplyViewEnabled) {
      viewType = this.VIEWS.REPLY.name;
    }
    this.setView(viewType);
  }

  private createInputsContext() {
    const flowMetadata = this.currentStatus.flowMetadata || { input: [] };
    const flowInputSchema = MapperTranslator.attributesToObjectDescriptor(flowMetadata.input);
    const triggerOutputSchema = MapperTranslator.attributesToObjectDescriptor(this.currentStatus.triggerSchema.outputs || []);
    const mappings = _.cloneDeep(this.editingMappings.actionInput);
    return StaticMapperContextFactory.create(flowInputSchema, triggerOutputSchema, mappings);
  }

  private createReplyContext() {
    const triggerReplySchema = MapperTranslator.attributesToObjectDescriptor(this.currentStatus.triggerSchema.reply || []);
    const flowMetadata = this.currentStatus.flowMetadata || { output: [] };
    const flowOutputSchema = MapperTranslator.attributesToObjectDescriptor(flowMetadata.output);
    const mappings = _.cloneDeep(this.editingMappings.actionOutput);
    return StaticMapperContextFactory.create(triggerReplySchema, flowOutputSchema, mappings);
  }

}
