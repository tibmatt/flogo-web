import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { FlowMetadata } from '@flogo/core/interfaces/flow';

export interface HandlerMappings {
  actionMappings: { input: any[], output: any[] };
}

interface TriggerDetail {
  handler: HandlerMappings;
  trigger: any;
  triggerSchema: any;
}

export interface ModalStatus {
  isOpen: boolean;
  triggers: TriggerDetail[];
  flowMetadata: FlowMetadata;
  selectedTrigger: string;
}

interface SaveData {
  trigger: any;
  mappings: HandlerMappings;
}

export interface ConfigurationStatus {
  triggerId: string;
  isValid: boolean;
  changedMappings: HandlerMappings;
}

@Injectable()
export class ConfiguratorService {

  modalStatus$ = new Subject<ModalStatus>();
  save$ = new Subject<SaveData>();
  triggerConfigurationStatus$ = new Subject<ConfigurationStatus>();

  open(trigger: any, flowMetadata: FlowMetadata, handler: HandlerMappings, triggerSchema: any) {
    const triggerToConfigure = Object.assign({}, {trigger, handler, triggerSchema});
    this.modalStatus$.next({ isOpen: true, triggers: [triggerToConfigure], flowMetadata, selectedTrigger: trigger.id });
  }

  close() {
    this.modalStatus$.next({ isOpen: false, triggers: [], flowMetadata: null, selectedTrigger: null });
  }

  save(trigger: any, mappings: HandlerMappings) {
    this.save$.next({ trigger, mappings });
    this.close();
  }

  updateTriggerStatus(newConfigurations: ConfigurationStatus) {
    this.triggerConfigurationStatus$.next(newConfigurations);
  }

}
