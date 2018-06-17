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
  TriggerChanges
} from './interfaces';
import {MapperTranslator, MappingsValidatorFn, Mappings} from '../../shared/mapper';
import {reduce as arrayReduce} from 'lodash';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {isEqual} from 'lodash';
import {createTabs} from './core/utils';
import {TRIGGER_TABS} from './core/constants';
import { select, Store } from '@ngrx/store';
import {AppState} from '../../core/state/app.state';
import { getConfigureModalState, getHasTriggersConfigure } from '../../core/state/triggers-configure/trigger-configure.selectors';
import {TriggerConfigureState} from '../../core';
import {AttributeMapping} from '@flogo/core';
import * as TriggerConfigureActions from '../../core/state/triggers-configure/trigger-configure.actions';
import { filter, switchMap } from 'rxjs/operators';

@Injectable()
export class ConfiguratorService {

  triggersToConfigure: Map<string, TriggerConfiguration> = new Map<string, TriggerConfiguration>();
  currentModalStatus: ModalStatus | null = null;

  configuratorStatus$ = new Subject<ConfiguratorStatus>();
  triggerMapperStatus$ = new BehaviorSubject<MapperStatus>(undefined);
  save$ = new Subject<SaveData[]>();

  private mappingValidationFn: MappingsValidatorFn = MapperTranslator.makeValidator();

  constructor(private store: Store<AppState>) {
    this.store
      .pipe(
        select(getHasTriggersConfigure),
        filter(hasTriggersConfigure => hasTriggersConfigure),
        switchMap(() => this.store.select(getConfigureModalState)),
      )
      .subscribe(modalState => {
        if (modalState.triggerConfigure && modalState.triggerConfigure.isOpen) {
          this.open(modalState);
        } else if (modalState.triggerConfigure && !modalState.triggerConfigure.isOpen) {
          this.close();
        }
    });
  }

  open(modalState: {triggers: TriggerDetail[], flowMetadata: FlowMetadata, triggerConfigure: TriggerConfigureState} | null) {
    const {triggers, flowMetadata} = modalState;
    this.currentModalStatus = {
      ...this.currentModalStatus,
      ...modalState.triggerConfigure,
      flowMetadata
    };
    this.initTriggersData(triggers);
    this.publishCompleteStatuses();
  }

  close() {
    this.reset();
    this.publishCompleteStatuses();
    this.store.dispatch(new TriggerConfigureActions.CloseConfigure());
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
    this.currentModalStatus.selectedTriggerId = triggerId;
    this.publishChangedTriggerSelection();
  }

  updateTriggerConfiguration(newConfigurations: TriggerChanges) {
    const triggerToUpdate = {
      ...this.triggersToConfigure.get(this.currentModalStatus.selectedTriggerId),
      ...newConfigurations
    };
    triggerToUpdate.isDirty = !isEqual(triggerToUpdate.changedMappings.actionMappings, triggerToUpdate.handler.actionMappings);
    this.triggersToConfigure.set(this.currentModalStatus.selectedTriggerId, triggerToUpdate);
    this.publishConfigurationChanges();
  }

  areValidMappings(mappings: Mappings) {
    return this.mappingValidationFn(mappings);
  }

  private initTriggersData(triggerDetailsList: TriggerDetail[]) {
    arrayReduce(triggerDetailsList, (triggersMap, triggerDetail) => {
      const triggerSchema = this.currentModalStatus.schemas[triggerDetail.trigger.ref];
      const triggerConfiguration: TriggerConfiguration = {
        ...triggerDetail,
        isValid: true,
        isDirty: false,
        tabs: createTabs(triggerSchema, this.currentModalStatus.flowMetadata)
      };
      const { input, output } = triggerDetail.handler.actionMappings;
      const mappings = {
        input: MapperTranslator.translateMappingsIn(input as AttributeMapping[]),
        output: MapperTranslator.translateMappingsIn(output as AttributeMapping[])
      };
      triggerConfiguration.tabs.get(TRIGGER_TABS.MAP_FLOW_INPUT).isValid = this.areValidMappings(mappings.input);
      triggerConfiguration.tabs.get(TRIGGER_TABS.MAP_FLOW_OUTPUT).isValid = this.areValidMappings(mappings.output);
      triggerConfiguration.isValid = triggerConfiguration.tabs.areValid();
      return triggersMap.set(triggerDetail.trigger.id, triggerConfiguration);
    }, this.triggersToConfigure);
  }

  private publishCompleteStatuses() {
    const triggerToConfigure = this.triggersToConfigure.get(this.currentModalStatus.selectedTriggerId);
    const triggerSchema = this.currentModalStatus.schemas[triggerToConfigure && triggerToConfigure.trigger.ref];
    this.configuratorStatus$.next({
      isOpen: this.currentModalStatus.isOpen,
      disableSave: true,
      selectedTriggerId: this.currentModalStatus.selectedTriggerId,
      triggers: this.getTriggerStatusForAll()
    });
    this.triggerMapperStatus$.next({
      flowMetadata: this.currentModalStatus.flowMetadata,
      triggerSchema: triggerSchema || null,
      handler: (triggerToConfigure && triggerToConfigure.handler) || null,
      tabs: (triggerToConfigure && triggerToConfigure.tabs) || null
    });
  }

  private publishChangedTriggerSelection() {
    const triggerToConfigure = this.triggersToConfigure.get(this.currentModalStatus.selectedTriggerId);
    const triggerSchema = this.currentModalStatus.schemas[triggerToConfigure.trigger.ref];
    const mapperNextStatus: MapperStatus = {
      flowMetadata: this.currentModalStatus.flowMetadata,
      triggerSchema: triggerSchema,
      handler: triggerToConfigure.handler,
      changedMappings: triggerToConfigure.changedMappings || null,
      tabs: triggerToConfigure.tabs || null
    };
    this.configuratorStatus$.next({
      selectedTriggerId: this.currentModalStatus.selectedTriggerId
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
    this.currentModalStatus = null;
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
