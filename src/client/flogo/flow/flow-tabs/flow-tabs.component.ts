import {Component} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {FlowActions, FlowSelectors, FlowState} from '@flogo/flow/core/state';
import {takeUntil} from 'rxjs/operators';
import {SingleEmissionSubject} from '@flogo/core/models';

@Component({
  selector: 'flogo-flow-tabs',
  templateUrl: './flow-tabs.component.html',
  styleUrls: ['./flow-tabs.component.less']
})

export class FlowTabsComponent {
  isErrorHandlerShown = false;
  private ngOnDestroy$ = SingleEmissionSubject.create();
  showBadgeForError = false;
  showBadgeForFlow = false;

  constructor(private store: Store<FlowState>) {
    this.store.pipe(select(FlowSelectors.selectErrorPanelStatus),
      takeUntil(this.ngOnDestroy$)).subscribe(isErrorPanelOpen => {
      if (isErrorPanelOpen) {
        this.isErrorHandlerShown = true;
      } else {
        this.isErrorHandlerShown = false;
      }
    });
    this.store.pipe(select(FlowSelectors.getAllCurrentExecutionErrors),
      takeUntil(this.ngOnDestroy$)).subscribe(executionError => {
      if (executionError.errorNodesExecution) {
        this.showBadgeForError = true;
      }
      if (executionError.mainNodesExecution) {
        this.showBadgeForFlow = true;
      }
    });
  }

  selectPrimaryFlow() {
    this.store.dispatch(new FlowActions.ErrorPanelStatusChange({isOpen: false}));
  }

  selectErrorHandler() {
    this.store.dispatch(new FlowActions.ErrorPanelStatusChange({isOpen: true}));
  }

}
