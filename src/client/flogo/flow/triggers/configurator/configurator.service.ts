import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { FlowMetadata } from '@flogo/core/interfaces/flow';

export interface HandlerMappings {
  actionMappings: { input: any[], output: any[] };
}

/*interface Status {
  isOpen: boolean;
  triggers: any[];
  flowMetadata: FlowMetadata;
  triggerSchema: any[];
  triggerToConfigure: string;
}*/

export interface ModalStatus {
  isOpen: boolean;
  handler: HandlerMappings;
  trigger: any;
  flowMetadata: FlowMetadata;
  triggerSchema: any;
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
    this.modalStatus$.next({ isOpen: true, trigger, handler, flowMetadata, triggerSchema });
  }

  close() {
    this.modalStatus$.next({ isOpen: false, trigger: null, handler: null, flowMetadata: null, triggerSchema: null });
  }

  save(trigger: any, mappings: HandlerMappings) {
    this.save$.next({ trigger, mappings });
    this.close();
  }

  updateTriggerStatus(newConfigurations: ConfigurationStatus) {
    this.triggerConfigurationStatus$.next(newConfigurations);
  }

}
