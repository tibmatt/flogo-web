import { cloneDeep } from 'lodash';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import {SingleEmissionSubject} from '@flogo/core/models/single-emission-subject';
import { FlowState } from '../../../core/state';
import { MapperController } from '@flogo/flow/shared/mapper/services/mapper-controller/mapper-controller';
import * as TriggerConfigureActions from '../../../core/state/triggers-configure/trigger-configure.actions';
import { TriggerConfigureTabType, TriggerConfigureTab } from '../../../core/interfaces';
import { Mappings, MapExpression, MapperTranslator, StaticMapperContextFactory } from '../../../shared/mapper';
import { MapperStatus } from '../interfaces';
import { TRIGGER_TABS } from '../core/constants';
import { Dictionary } from '@flogo/core';
import { AttributeDescriptor } from '@flogo/flow/shared/mapper/utils';

@Component({
  selector: 'flogo-flow-trigger-mapper',
  styleUrls: [
    'trigger-mapper.component.less'
  ],
  templateUrl: 'trigger-mapper.component.html'
})
export class TriggerMapperComponent implements OnDestroy {

  currentMapperState: MapperStatus = {
    flowMetadata: null,
    handler: null,
    triggerSchema: null,
    tabs: null
  };
  currentViewName: string;

  @Input() mapperController: MapperController;
  private ngDestroy$ = SingleEmissionSubject.create();

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }

  get currentViewStatus() {
    return this.currentMapperState.tabs && this.currentMapperState.tabs.get(this.currentViewName);
  }
}
