import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import { SingleEmissionSubject } from '../../common/models/single-emission-subject';
import { TriggerMapperService, Status } from './trigger-mapper.service';
import { IMapping } from '../flogo.mapper';
import { IMapExpression } from '../flogo.mapper/models/map-model';
import { MapperTranslator } from '../flogo.mapper/utils/mapper-translator';
import { StaticMapperContextFactory } from '../flogo.mapper/utils/static-mapper-context-factory';

import 'rxjs/add/operator/takeUntil';

const VIEWS = {
  INPUTS: 'inputs',
  OUTPUTS: 'outputs',
};

@Component({
  selector: 'flogo-trigger-mapper',
  styleUrls: ['trigger-mapper.component.less'],
  templateUrl: 'trigger-mapper.component.html'
})
export class TriggerMapperComponent implements OnInit, OnDestroy {
  // allow access to the constants from the template
  VIEWS = VIEWS;
  @ViewChild(ModalComponent) modal: ModalComponent;

  mapperContext: any;
  currentStatus: Status = { isOpen: false, flowMetadata: null, triggerSchema: null, handler: null, trigger: null };
  currentView: string;

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
    if (this.currentView === this.VIEWS.INPUTS) {
      this.editingMappings.actionInput = mappings;
    } else if (this.currentView === this.VIEWS.OUTPUTS) {
      this.editingMappings.actionOutput = mappings;
    }
  }

  onSave() {
    this.triggerMapperService.save(this.currentStatus.trigger, {
      actionInputMappings: MapperTranslator.translateMappingsOut(this.editingMappings.actionInput),
      actionOutputMappings: MapperTranslator.translateMappingsOut(this.editingMappings.actionOutput),
    });
  }

  setView(viewType: string) {
    this.currentView = viewType;
    if (viewType === VIEWS.INPUTS) {
      this.mapperContext = this.createInputsContext();
    } else if (viewType === VIEWS.OUTPUTS) {
      this.mapperContext = this.createOutputsContext();
    }
  }

  private onNextStatus(nextStatus: Status) {
    this.currentStatus = Object.assign({}, nextStatus);
    if (nextStatus.isOpen) {
      const { actionInputMappings, actionOutputMappings } = nextStatus.handler;
      this.editingMappings = {
        actionInput: MapperTranslator.translateMappingsIn(actionInputMappings),
        actionOutput: MapperTranslator.translateMappingsIn(actionOutputMappings),
      };
      this.modal.open();
      this.setView(VIEWS.INPUTS);
    } else if (this.modal.visible) {
      this.modal.close();
    }
  }

  private createInputsContext() {
    const flowMetadata = this.currentStatus.flowMetadata || { input: [] };
    const flowInputSchema = MapperTranslator.attributesToObjectDescriptor(flowMetadata.input);
    const triggerOutputSchema = MapperTranslator.attributesToObjectDescriptor(this.currentStatus.triggerSchema.outputs || []);
    const mappings = _.cloneDeep(this.editingMappings.actionInput);
    return StaticMapperContextFactory.create(flowInputSchema, triggerOutputSchema, mappings);
  }

  private createOutputsContext() {
    const triggerReplySchema = MapperTranslator.attributesToObjectDescriptor(this.currentStatus.triggerSchema.reply || []);
    const flowMetadata = this.currentStatus.flowMetadata || { output: [] };
    const flowOutputSchema = MapperTranslator.attributesToObjectDescriptor(flowMetadata.output);
    const mappings = _.cloneDeep(this.editingMappings.actionOutput);
    return StaticMapperContextFactory.create(triggerReplySchema, flowOutputSchema, mappings);
  }

}
