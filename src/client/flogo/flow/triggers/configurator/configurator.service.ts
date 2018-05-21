import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {FlowMetadata} from '@flogo/core/interfaces/flow';
import {
  ModalStatus,
  SaveData,
  TriggerDetail,
  TriggerConfiguration,
  ConfiguratorStatus,
  TriggerStatus,
  MapperStatus,
  HandlerMappings,
  TriggerChanges
} from './interfaces';
import {MapperTranslator, MappingsValidatorFn, IMapping} from '../../shared/mapper';
import {Tabs} from '../../shared/tabs/models/tabs.model';
import {reduce as arrayReduce} from 'lodash';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {isEqual} from 'lodash';

export const TRIGGER_TABS = {
  MAP_FLOW_INPUT: 'mapFlowInput',
  MAP_FLOW_OUTPUT: 'mapFlowOutput'
};

const defaultTabsInfo: { name: string, labelKey: string }[] = [
  {name: TRIGGER_TABS.MAP_FLOW_INPUT, labelKey: 'TRIGGER-CONFIGURATOR:FLOW-INPUTS'},
  {name: TRIGGER_TABS.MAP_FLOW_OUTPUT, labelKey: 'TRIGGER-CONFIGURATOR:FLOW-OUTPUTS'}
];

@Injectable()
export class ConfiguratorService {

  triggersToConfigure: Map<string, TriggerConfiguration> = new Map<string, TriggerConfiguration>();
  currentModalStatus: ModalStatus = {
    isOpen: false,
    flowMetadata: null,
    selectedTriggerID: null
  };

  configuratorStatus$ = new Subject<ConfiguratorStatus>();
  triggerMapperStatus$ = new BehaviorSubject<MapperStatus>(undefined);
  save$ = new Subject<SaveData[]>();

  private mappingValidationFn: MappingsValidatorFn = MapperTranslator.makeValidator();

  open(triggers: TriggerDetail[], flowMetadata: FlowMetadata, triggerId: string) {
    this.currentModalStatus = {
      ...this.currentModalStatus,
      isOpen: true,
      flowMetadata,
      selectedTriggerID: triggerId
    };
    this.initTriggersData(triggers);
    this.publishCompleteStatuses();
  }

  close() {
    this.reset();
    this.publishCompleteStatuses();
  }

  save() {
    const prepareSavableData = (triggerConfiguration: TriggerConfiguration) => ({
      trigger: triggerConfiguration.trigger,
      mappings: triggerConfiguration.changedMappings
    });
    const dataToSave = Array.from(this.triggersToConfigure.values()).filter(t => t.isDirty).map(prepareSavableData);
    this.save$.next(dataToSave);
    this.close();
  }

  selectTrigger(triggerId: string) {
    this.currentModalStatus.selectedTriggerID = triggerId;
    this.publishChangedTriggerSelection();
  }

  updateTriggerConfiguration(newConfigurations: TriggerChanges) {
    const triggerToUpdate = {
      ...this.triggersToConfigure.get(this.currentModalStatus.selectedTriggerID),
      ...newConfigurations
    };
    triggerToUpdate.isDirty = !isEqual(triggerToUpdate.changedMappings.actionMappings, triggerToUpdate.handler.actionMappings);
    this.triggersToConfigure.set(this.currentModalStatus.selectedTriggerID, triggerToUpdate);
    this.publishConfigurationChanges();
  }

  areValidMappings(mappings: IMapping) {
    return this.mappingValidationFn(mappings);
  }

  private initTriggersData(triggerDetailsList: TriggerDetail[]) {
    arrayReduce(triggerDetailsList, (triggersMap, triggerDetail) => {
      const triggerConfiguration: TriggerConfiguration = {
        ...triggerDetail,
        isValid: true,
        isDirty: false,
        tabs: this.createTabs(triggerDetail.triggerSchema, triggerDetail.handler)
      };
      triggerConfiguration.isValid = triggerConfiguration.tabs.areValid();
      return triggersMap.set(triggerDetail.trigger.id, triggerConfiguration);
    }, this.triggersToConfigure);
  }

  private publishCompleteStatuses() {
    const triggerToConfigure = this.triggersToConfigure.get(this.currentModalStatus.selectedTriggerID);
    this.configuratorStatus$.next({
      isOpen: this.currentModalStatus.isOpen,
      disableSave: true,
      selectedTriggerID: this.currentModalStatus.selectedTriggerID,
      triggers: this.getTriggerStatusForAll()
    });
    this.triggerMapperStatus$.next({
      flowMetadata: this.currentModalStatus.flowMetadata,
      triggerSchema: (triggerToConfigure && triggerToConfigure.triggerSchema) || null,
      handler: (triggerToConfigure && triggerToConfigure.handler) || null,
      tabs: (triggerToConfigure && triggerToConfigure.tabs) || null
    });
  }

  createTabs(triggerSchema, handler: HandlerMappings) {
    const tabs = Tabs.create(defaultTabsInfo);
    const flowMetadata = this.currentModalStatus.flowMetadata;
    const { input, output } = handler.actionMappings;
    const mappings = {
      input: MapperTranslator.translateMappingsIn(input),
      output: MapperTranslator.translateMappingsIn(output)
    };
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
    tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).inputsLabelKey = 'TRIGGER-MAPPER:LABEL-FLOW-INPUTS';
    tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).outputsLabelKey = 'TRIGGER-MAPPER:LABEL-TRIGGER-OUTPUT';
    tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).enabled = hasTriggerOutputs && hasFlowInputs;
    tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).isValid = this.areValidMappings({
      mappings: mappings.input
    });
    tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).inputsLabelKey = 'TRIGGER-MAPPER:LABEL-TRIGGER-REPLY-ATTRIBUTES';
    tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).outputsLabelKey = 'TRIGGER-MAPPER:LABEL-FLOW-OUTPUTS';
    tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).enabled = hasTriggerReply && hasFlowOutputs;
    tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).isValid = this.areValidMappings({
      mappings: mappings.output
    });
    return tabs;
  }

  private publishChangedTriggerSelection() {
    const triggerToConfigure = this.triggersToConfigure.get(this.currentModalStatus.selectedTriggerID);
    const mapperNextStatus: MapperStatus = {
      flowMetadata: this.currentModalStatus.flowMetadata,
      triggerSchema: triggerToConfigure.triggerSchema,
      handler: triggerToConfigure.handler,
      changedMappings: triggerToConfigure.changedMappings || null,
      tabs: triggerToConfigure.tabs || null
    };
    this.configuratorStatus$.next({
      selectedTriggerID: this.currentModalStatus.selectedTriggerID
    });
    this.triggerMapperStatus$.next(mapperNextStatus);
  }

  private publishConfigurationChanges() {
    // update save button state, triggers in the configuratorStatus
    this.configuratorStatus$.next({
      disableSave: this.isSaveDisabled(),
      triggers: this.getTriggerStatusForAll()
    });
  }

  private reset() {
    this.currentModalStatus = {
      isOpen: false,
      flowMetadata: null,
      selectedTriggerID: null
    };
    this.triggersToConfigure.clear();
  }

  private isSaveDisabled() {
    const allTriggers = Array.from(this.triggersToConfigure.values());
    const hasInvalidTriggerMappings = !!allTriggers.find(triggerObj => !triggerObj.isValid);
    const hasModifiedTriggerMapping = !!allTriggers.find(triggerObj => triggerObj.isDirty);
    return !hasModifiedTriggerMapping || hasInvalidTriggerMappings;
  }

  private getTriggerStatusForAll(): TriggerStatus[] {
    return Array.from(this.triggersToConfigure.values()).map((triggerConfig: TriggerConfiguration) => ({
      id: triggerConfig.trigger.id,
      isDirty: triggerConfig.isDirty,
      isValid: triggerConfig.isValid,
      name: triggerConfig.trigger.name
    }));
  }
}
