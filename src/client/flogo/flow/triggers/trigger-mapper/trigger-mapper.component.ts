import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import { SingleEmissionSubject } from '@flogo/core/models/single-emission-subject';
import 'rxjs/add/operator/takeUntil';

import { IMapping, IMapExpression, MapperTranslator, MappingsValidatorFn, StaticMapperContextFactory } from '../../shared/mapper';
import { FlowMetadata } from '@flogo/core/interfaces/flow';

import { VIEWS, ViewInfo } from './views-info.model';
import { TriggerMapperService, Status } from './trigger-mapper.service';

interface ViewState extends ViewInfo {
  enabled: boolean;
  valid: boolean;
}

interface ViewsStates {
  [name: string]: ViewState;
}

@Component({
  selector: 'flogo-flow-trigger-mapper',
  styleUrls: [
    '../../../../assets/_mapper-modal.less',
    'trigger-mapper.component.less'
  ],
  templateUrl: 'trigger-mapper.component.html'
})
export class TriggerMapperComponent implements OnInit, OnDestroy {
  // allow access to the constants from the template
  VIEWS = VIEWS;
  @ViewChild(ModalComponent) modal: ModalComponent;

  mapperContext: any;
  mappingValidationFn: MappingsValidatorFn;
  currentStatus: Status = { isOpen: false, flowMetadata: null, triggerSchema: null, handler: null, trigger: null };

  currentViewName: string;
  viewStates: ViewsStates = {};

  private editingMappings: {
    actionInput: { [key: string]: IMapExpression };
    actionOutput: { [key: string]: IMapExpression };
  };
  private ngDestroy = SingleEmissionSubject.create();

  static makeViewState(fromViewInfo: ViewInfo, state: { valid: boolean, enabled: boolean }): ViewState {
    const { name, inputsLabelKey, outputsLabelKey } = fromViewInfo;
    return {
      name,
      inputsLabelKey,
      outputsLabelKey,
      enabled: state.enabled,
      valid: state.valid,
    };
  }

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
    const currentView = this.currentViewStatus;
    if (currentView.name === this.VIEWS.INPUTS.name) {
      this.editingMappings.actionInput = mappings;
    } else if (currentView.name === this.VIEWS.REPLY.name) {
      this.editingMappings.actionOutput = mappings;
    } else {
      return;
    }
    currentView.valid = this.mappingValidationFn({ mappings });
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
    this.currentViewName = viewName;
    if (viewName === VIEWS.INPUTS.name) {
      this.setupInputsContext();
    } else if (viewName === VIEWS.REPLY.name) {
      this.setupReplyContext();
    }
  }

  get inputsView(): ViewState {
    return this.viewStates[this.VIEWS.INPUTS.name];
  }

  get replyView(): ViewState {
    return this.viewStates[this.VIEWS.REPLY.name];
  }

  get currentViewStatus() {
    return this.viewStates[this.currentViewName];
  }

  private onNextStatus(nextStatus: Status) {
    this.currentStatus = Object.assign({}, nextStatus);
    if (nextStatus.isOpen) {
      const { actionMappings } = nextStatus.handler;
      const { input, output } = actionMappings;
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

    this.viewStates = {
      [this.VIEWS.INPUTS.name]: TriggerMapperComponent.makeViewState(
        this.VIEWS.INPUTS,
        { enabled: hasTriggerOutputs && hasFlowInputs, valid: true }
        ),
      [this.VIEWS.REPLY.name]: TriggerMapperComponent.makeViewState(
        this.VIEWS.REPLY,
        { enabled: hasTriggerReply && hasFlowOutputs, valid: true }
      ),
    };

    let viewType: string = this.VIEWS.INPUTS.name;
    if (this.inputsView.enabled) {
      viewType = this.VIEWS.INPUTS.name;
    } else if (this.replyView.enabled) {
      viewType = this.VIEWS.REPLY.name;
    }
    this.setCurrentView(viewType);
  }

  private setupInputsContext() {
    const flowMetadata = this.currentStatus.flowMetadata || { input: [] };
    const flowInputSchema = MapperTranslator.attributesToObjectDescriptor(flowMetadata.input);
    const triggerOutputSchema = MapperTranslator.attributesToObjectDescriptor(this.currentStatus.triggerSchema.outputs || []);
    const mappings = _.cloneDeep(this.editingMappings.actionInput);

    this.mapperContext = StaticMapperContextFactory.create(flowInputSchema, triggerOutputSchema, mappings);
    this.mappingValidationFn = MapperTranslator.makeValidator();
  }

  private setupReplyContext() {
    const triggerReplySchema = MapperTranslator.attributesToObjectDescriptor(this.currentStatus.triggerSchema.reply || []);
    const flowMetadata = this.currentStatus.flowMetadata || { output: [] };
    const flowOutputSchema = MapperTranslator.attributesToObjectDescriptor(flowMetadata.output);
    const mappings = _.cloneDeep(this.editingMappings.actionOutput);

    this.mapperContext = StaticMapperContextFactory.create(triggerReplySchema, flowOutputSchema, mappings);
    this.mappingValidationFn = MapperTranslator.makeValidator();
  }

}
