import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { FlowMetadata } from '../flogo.flows.detail/models';

export interface Status {
  isOpen: boolean;
  handler: { actionInputMappings?: any, actionOutputMappings?: any };
  trigger: any;
  flowMetadata: FlowMetadata;
  triggerSchema: any;
}

export interface SaveData {
  trigger: any;
  mappings: { actionInputMappings: any, actionOutputMappings: any };
}

@Injectable()
export class TriggerMapperService {

  status$ = new Subject<Status>();
  save$ = new Subject<SaveData>();

  constructor() {
  }

  open(trigger: any, flowMetadata: FlowMetadata, handler: { actionInputMappings?: any, actionOutputMappings?: any }, triggerSchema: any) {
    this.status$.next({ isOpen: true, trigger, handler, flowMetadata, triggerSchema });
  }

  close() {
    this.status$.next({ isOpen: false, trigger: null, handler: null, flowMetadata: null, triggerSchema: null });
  }

  save(trigger: any, mappings: { actionInputMappings: any, actionOutputMappings: any }) {
    this.save$.next({ trigger, mappings });
    this.close();
  }

}
