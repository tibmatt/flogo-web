import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { FlowMetadata } from '@flogo/core/interfaces/flow';
import {ConfigurationStatus, ModalStatus, SaveData, TriggerDetail} from './interfaces';

@Injectable()
export class ConfiguratorService {

  modalStatus$ = new Subject<ModalStatus>();
  save$ = new Subject<SaveData[]>();
  triggerConfigurationStatus$ = new Subject<ConfigurationStatus>();

  open(triggersToConfigure: TriggerDetail[], flowMetadata: FlowMetadata, triggerId: string) {
    this.modalStatus$.next({ isOpen: true, triggers: triggersToConfigure, flowMetadata, selectedTrigger: triggerId });
  }

  close() {
    this.modalStatus$.next({ isOpen: false, triggers: [], flowMetadata: null, selectedTrigger: null });
  }

  save(triggers: SaveData[]) {
    this.save$.next(triggers);
    this.close();
  }

  updateTriggerStatus(newConfigurations: ConfigurationStatus) {
    this.triggerConfigurationStatus$.next(newConfigurations);
  }

}
