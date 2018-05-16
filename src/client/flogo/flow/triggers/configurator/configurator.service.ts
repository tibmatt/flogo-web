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
  triggers: any[];
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

  open(triggersToConfigure: TriggerDetail[], flowMetadata: FlowMetadata, triggerId: string) {
    this.modalStatus$.next({ isOpen: true, triggers: triggersToConfigure, flowMetadata, selectedTrigger: triggerId });
  }

  close() {
    this.modalStatus$.next({ isOpen: false, triggers: [], flowMetadata: null, selectedTrigger: null });
  }

  save(triggers: any[]) {
    this.save$.next({ triggers});
    this.close();
  }

  updateTriggerStatus(newConfigurations: ConfigurationStatus) {
    this.triggerConfigurationStatus$.next(newConfigurations);
  }

}
