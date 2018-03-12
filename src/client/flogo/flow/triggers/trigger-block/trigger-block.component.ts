import {Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {IFlogoTrigger} from '@flogo/flow/triggers/models';
import {NavigationEnd, Router} from '@angular/router';
import {SingleEmissionSubject} from '@flogo/core/models/single-emission-subject';
import {TriggerMenuSelectionEvent} from '@flogo/flow/triggers/trigger-block/models';
import {TRIGGER_MENU_OPERATION} from '@flogo/core/constants';

export interface TriggerMenuSelectionEvent {
  operation: string;
  trigger: IFlogoTrigger;
}

@Component({
  selector: 'flogo-flow-triggers-trigger-block',
  templateUrl: './trigger-block.component.html',
  styleUrls: ['./trigger-block.component.less']
})

export class TriggerBlockComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  trigger: IFlogoTrigger;
  @Input()
  keepSelected: boolean;
  @Input()
  isDevice: boolean;
  @Output()
  menuItemSelected: EventEmitter<TriggerMenuSelectionEvent> = new EventEmitter<TriggerMenuSelectionEvent>();

  isShowingMenu = false;
  MENU_OPTIONS: typeof TRIGGER_MENU_OPERATION = TRIGGER_MENU_OPERATION;

  private isShowingDetails = false;
  private isShowingMapper = false;
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
    if (changes['keepSelected'] && !changes['keepSelected'].currentValue && this.isShowingMapper) {
      this.isShowingMapper = false;
    } else if (changes['trigger'] && !this.urlCheckRegEx) {
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

  get isSelected(): boolean {
    /***
     * Select a trigger either if (not restricted to one):
     *  1. it's trigger menu is active
     *  2. it's configuration is displayed in the trigger details (right hand side) panel
     *  3. it's mapper is active
     ***/
    return this.isShowingDetails || this.isShowingMapper;
  }

  selectedMenuItem(item: string) {
    if (item === TRIGGER_MENU_OPERATION.CONFIGURE) {
      this.isShowingMapper = true;
    }
    this.isShowingMenu = false;
    this.menuItemSelected.emit({operation: item, trigger: this.trigger});
  }
}
