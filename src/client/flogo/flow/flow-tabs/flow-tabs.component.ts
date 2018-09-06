import {Component} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {
  FlowActions, FlowSelectors, FlowState, getErrorFlowHasExecutionErrors,
  getPrimaryFlowHasExecutionErrors
} from '@flogo/flow/core/state';
import {takeUntil} from 'rxjs/operators';
import {SingleEmissionSubject} from '@flogo/core/models';
import {Observable} from 'rxjs/index';

@Component({
  selector: 'flogo-flow-tabs',
  templateUrl: './flow-tabs.component.html',
  styleUrls: ['./flow-tabs.component.less']
})

export class FlowTabsComponent {
  isErrorHandlerShown = false;
  private ngOnDestroy$ = SingleEmissionSubject.create();
  showBadgeForError$ = new Observable<any>();
  showBadgeForFlow$ = new Observable<any>();

  constructor(private store: Store<FlowState>) {
    this.store.pipe(select(FlowSelectors.selectErrorPanelStatus),
      takeUntil(this.ngOnDestroy$)).subscribe(isErrorPanelOpen => {
      if (isErrorPanelOpen) {
        this.isErrorHandlerShown = true;
      } else {
        this.isErrorHandlerShown = false;
      }
    });
    this.showBadgeForFlow$ = this.store.pipe(select(getPrimaryFlowHasExecutionErrors));
    this.showBadgeForError$ = this.store.pipe(select(getErrorFlowHasExecutionErrors));

  }

  selectPrimaryFlow() {
    this.store.dispatch(new FlowActions.ErrorPanelStatusChange({isOpen: false}));
  }

  selectErrorHandler() {
    this.store.dispatch(new FlowActions.ErrorPanelStatusChange({isOpen: true}));
  }

}
