import {Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {SingleEmissionSubject} from '@flogo/core/models/single-emission-subject';
import {TriggerMenuSelectionEvent} from '@flogo/flow/triggers/trigger-block/models';
import {TRIGGER_MENU_OPERATION} from '@flogo/core/constants';
import {Trigger} from '../../core';

export interface TriggerMenuSelectionEvent {
  operation: string;
  trigger: Trigger;
}

@Component({
  selector: 'flogo-flow-triggers-trigger-block',
  templateUrl: './trigger-block.component.html',
  styleUrls: ['./trigger-block.component.less']
})

export class TriggerBlockComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  trigger: Trigger;
  @Input()
  isDevice: boolean;
  @Output()
  menuItemSelected: EventEmitter<TriggerMenuSelectionEvent> = new EventEmitter<TriggerMenuSelectionEvent>();

  isShowingMenu = false;
  isShowingDetails = false;
  MENU_OPTIONS: typeof TRIGGER_MENU_OPERATION = TRIGGER_MENU_OPERATION;

  private nativeElement: any;
  private ngDestroy$ = SingleEmissionSubject.create();
  private urlCheckRegEx: RegExp;

  constructor(private _eref: ElementRef,
              private _router: Router) {
    this.nativeElement = this._eref.nativeElement;
  }


  ngOnInit() {
    this._router.events
      .filter(event => event instanceof NavigationEnd)
      .takeUntil(this.ngDestroy$)
      .subscribe((navigationEvent: NavigationEnd) => {
        // after upgrading to v4 using the router snapshot might be a better idea like this:
        // this._router.routerState.snapshot;
        if (!this.urlCheckRegEx.test(navigationEvent.url)) {
          this.isShowingDetails = false;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['trigger'] && !this.urlCheckRegEx) {
      this.urlCheckRegEx = new RegExp(`/trigger/${this.trigger.id}+$`, 'g');
    }
  }

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }


  get isLambda(): boolean {
    return this.trigger && this.trigger.ref === 'github.com/TIBCOSoftware/flogo-contrib/trigger/lambda';
  }

  handleTriggerSelection() {
    this.isShowingDetails = true;
    this.menuItemSelected.emit({operation: TRIGGER_MENU_OPERATION.SHOW_SETTINGS, trigger: this.trigger});
  }

  handleTriggerMenuShow() {
    if (!this.isDevice) {
      this.isShowingMenu = true;
    }
  }

  handleTriggerMenuHide() {
    this.isShowingMenu = false;
  }

  selectedMenuItem(item: string) {
    this.isShowingMenu = false;
    this.menuItemSelected.emit({operation: item, trigger: this.trigger});
  }
}
