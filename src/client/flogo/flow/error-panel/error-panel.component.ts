import { Component, HostBinding, OnDestroy, HostListener, TemplateRef, Input } from '@angular/core';
import { animate, style, transition, trigger, AnimationEvent, state } from '@angular/animations';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FlowState, FlowActions, FlowSelectors } from '../core/state';

const TOGGLE_BUTTON_HEIGHT = 48;
const NAV_HEIGHT = 48;

@Component({
  selector: 'flogo-flow-error-panel',
  templateUrl: 'error-panel.component.html',
  styleUrls: ['error-panel.component.less'],
  animations: [
    trigger('errorPanelIsOpen', [
      state('false', style({ transform: `translateY(calc(100% - ${TOGGLE_BUTTON_HEIGHT}px))` })),
      state('true', style({ transform: '*' })),
      transition('false => true', animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('true => false', animate('200ms cubic-bezier(0.4, 0.0, 1, 1)')),
    ]),
    trigger('panelContent', []),
  ],
})
export class FlogoFlowsDetailErrorPanelComponent implements OnDestroy {
  @Input() templateRef: TemplateRef<any>;
  @HostBinding('class.is-open') isOpen = false;
  displayContent = false;
  isAnimating = false;
  isScreenScrolled  = false;

  private subscription: Subscription;

  constructor(private store: Store<FlowState>) {
    this.subscription = this.store
      .pipe(
        select(FlowSelectors.selectErrorPanelStatus),
        filter(isErrorPanelOpen => this.isOpen !== isErrorPanelOpen),
      )
      .subscribe(isErrorPanelOpen => {
        this.isOpen = isErrorPanelOpen;
        if (isErrorPanelOpen) {
          this.displayContent = true;
        }
      });
  }

  public toggle() {
    this.store.dispatch(new FlowActions.ErrorPanelStatusChange({ isOpen: !this.isOpen }));
  }

  public open() {
    if (!this.isOpen) {
      this.toggle();
    }
  }

  public close() {
    if (this.isOpen) {
      this.toggle();
    }
  }

  public onAnimationEnd(event: AnimationEvent) {
    if (!event.toState) {
      this.displayContent = false;
    }
    this.isAnimating = false;
  }

  public onAnimationStart() {
    this.isAnimating = true;
  }

  public ngOnDestroy(): any {
    this.subscription.unsubscribe();
  }

  @HostListener('window:scroll', ['$event'])
  onPageScroll(event: UIEvent) {
    if (this.isOpen) {
      const target: any = event.target;
      this.isScreenScrolled = Boolean(target && target.body && target.body.scrollTop > NAV_HEIGHT);
    }
  }

}
