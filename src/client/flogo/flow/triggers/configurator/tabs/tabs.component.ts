import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { FlowState } from '@flogo/flow/core/state';
import { takeUntil } from 'rxjs/operators';
import { getCurrentTabs, getCurrentTabType } from '@flogo/flow/core/state/triggers-configure/trigger-configure.selectors';
import { Observable } from 'rxjs/Observable';
import { SingleEmissionSubject } from '@flogo/core/models/single-emission-subject';
import { TriggerConfigureTab, TriggerConfigureTabType } from '@flogo/flow/core/interfaces';
import * as TriggerConfigureActions from '@flogo/flow/core/state/triggers-configure/trigger-configure.actions';

@Component({
  selector: 'flogo-flow-triggers-configurator-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.less']
})
export class TabsComponent implements OnInit, OnDestroy {
  currentTabType: TriggerConfigureTabType;
  tabs$: Observable<TriggerConfigureTab[]>;
  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(private store: Store<FlowState>) { }

  ngOnInit() {
    this.tabs$ = this.store.pipe(getCurrentTabs);
    this.store
      .select(getCurrentTabType)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(currentTabType => this.currentTabType = currentTabType);
  }

  selectTab(tab: TriggerConfigureTab) {
    this.store.dispatch(new TriggerConfigureActions.SelectTab(tab.type));
  }

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }

  trackTabsByFn(index, tab: TriggerConfigureTab) {
    return tab.type;
  }

}
