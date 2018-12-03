import { Component, HostBinding, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval, of } from 'rxjs';
import { delayWhen } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';

import { FlowState, FlowActions, FlowSelectors } from '@flogo-web/client/flow/core/state';

import { MINIMIZED_WIDTH, CLOSE_WRAPPER_ANIMATION_DURATION } from '../variables';
import { TogglerRefService } from '../toggler-ref.service';

@Component({
  selector: 'flogo-debug-panel-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.less'],
})
export class ToggleButtonComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('style.width') width = MINIMIZED_WIDTH;
  @HostBinding('class.is-open') isPanelOpen: boolean;
  private panelStateSubscription: Subscription;

  constructor(private elementRef: ElementRef, private store: Store<FlowState>, private togglerRef: TogglerRefService) {}

  ngOnInit() {
    this.panelStateSubscription = this.store
      .pipe(
        select(FlowSelectors.selectDebugPanelOpen),
        delayWhen(isOpen => (!isOpen ? interval(CLOSE_WRAPPER_ANIMATION_DURATION) : of(0)))
      )
      .subscribe(isOpen => (this.isPanelOpen = isOpen));
  }

  ngAfterViewInit() {
    this.togglerRef.registerRef(this.elementRef);
  }

  ngOnDestroy() {
    this.togglerRef.removeRef();
    this.panelStateSubscription.unsubscribe();
  }

  open() {
    this.store.dispatch(new FlowActions.DebugPanelStatusChange({ isOpen: true }));
  }
}
