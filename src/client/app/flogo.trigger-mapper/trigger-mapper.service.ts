import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { FlowMetadata } from '../flow/core/models';

interface HandlerMappings {
  actionMappings: { input: any[], output: any[] };
}

export interface Status {
  isOpen: boolean;
  handler: HandlerMappings;
  trigger: any;
  flowMetadata: FlowMetadata;
  triggerSchema: any;
}

export interface SaveData {
  trigger: any;
  mappings: HandlerMappings;
}

@Injectable()
export class TriggerMapperService {

  status$ = new Subject<Status>();
  save$ = new Subject<SaveData>();

  constructor() {
  }

  open(trigger: any, flowMetadata: FlowMetadata, handler: HandlerMappings, triggerSchema: any) {
    this.status$.next({ isOpen: true, trigger, handler, flowMetadata, triggerSchema });
  }

  close() {
    this.status$.next({ isOpen: false, trigger: null, handler: null, flowMetadata: null, triggerSchema: null });
  }

  save(trigger: any, mappings: HandlerMappings) {
    this.save$.next({ trigger, mappings });
    this.close();
  }

}
