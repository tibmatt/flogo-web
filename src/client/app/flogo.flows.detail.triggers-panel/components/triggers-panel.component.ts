import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FLOGO_PROFILE_TYPE} from '../../../common/constants';

export interface IFlogoTriggers {
  name: string;
  ref: string;
  description: string;
  settings: any;
  id: string;
  createdAt: string;
  updatedAt: string | null;
  handlers: any[];
  appId: string;
}

@Component({
  selector : 'flogo-flows-detail-triggers-panel',
  templateUrl : 'triggers-panel.tpl.html',
  styleUrls : [ 'triggers-panel.component.less' ]
})
export class FlogoFlowTriggersPanelComponent implements OnChanges {
  @Input()
  triggers: IFlogoTriggers[];
  @Input()
  actionId: string;
  @Input()
  appDetails: {appId: string, appProfileType:  FLOGO_PROFILE_TYPE};
  triggersList: any[] = [];

  constructor() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['triggers']) {
      this.triggersList = [];
      this.triggers.forEach(t => {
        const handlers = t.handlers.filter(a => a.actionId === this.actionId);
        handlers.forEach(h => {
          this.triggersList.push(_.assign({}, t, {handler: h}));
        });
      });
    }
  }
}
