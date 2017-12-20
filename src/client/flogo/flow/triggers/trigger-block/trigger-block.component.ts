import {Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {IFlogoTrigger} from '@flogo/flow/triggers/models';
import {NavigationEnd, Router} from '@angular/router';
import {SingleEmissionSubject} from '@flogo/core/models/single-emission-subject';
import {ITriggerMenuSelectionEvent} from '@flogo/flow/triggers/trigger-block/models';
import {TRIGGER_MENU_OPERATION} from '@flogo/core/constants';

export interface ITriggerMenuSelectionEvent {
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
  mapperWindowState: boolean;
  @Input()
  isDevice: boolean;
  @Output()
  onMenuItemSelected: EventEmitter<ITriggerMenuSelectionEvent> = new EventEmitter<ITriggerMenuSelectionEvent>();

  MENU_OPTIONS: typeof TRIGGER_MENU_OPERATION = TRIGGER_MENU_OPERATION;

  private isShowingDetails = false;
  private isShowingMapper = false;
  private isShowingMenu = false;
  private nativeElement: any;
  private _ngDestroy$ = SingleEmissionSubject.create();
  private urlCheckRegEx: RegExp;

  constructor(private _eref: ElementRef,
              private _router: Router) {
    this.nativeElement = this._eref.nativeElement;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (event.target !== this.nativeElement && !this.nativeElement.contains(event.target)) {
      this.isShowingMenu = false;
    }
  }

  ngOnInit() {
    this._router.events
      .filter(event => event instanceof NavigationEnd)
      .takeUntil(this._ngDestroy$)
      .subscribe((navigationEvent: NavigationEnd) => {
        // after upgrading to v4 using the router snapshot might be a better idea like this:
        // this._router.routerState.snapshot;
        if (!this.urlCheckRegEx.test(navigationEvent.url)) {
          this.isShowingDetails = false;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mapperWindowState'] && !changes['mapperWindowState'].currentValue && this.isShowingMapper) {
      this.isShowingMapper = false;
    } else if (changes['trigger'] && !this.urlCheckRegEx) {
      this.urlCheckRegEx = new RegExp(`/trigger/${this.trigger.id}+$`, 'g');
    }
  }

  ngOnDestroy() {
    this._ngDestroy$.emitAndComplete();
  }

  get isMenuOpen(): boolean {
    return this.isShowingMenu;
  }

  get isLambda(): boolean {
    return this.trigger && this.trigger.ref === 'github.com/TIBCOSoftware/flogo-contrib/trigger/lambda';
  }

  handleTriggerSelection() {
    this.isDevice ? this.selectedMenuItem(this.MENU_OPTIONS.CONFIGURE) : this.isShowingMenu = true;
  }

  shouldAddSelectedClass(): boolean {
    /***
     * Select a trigger either if (not restricted to one):
     *  1. it's trigger menu is active
     *  2. it's configuration is displayed in the trigger details (right hand side) panel
     *  3. it's mapper is active
     ***/
    return this.isShowingDetails || this.isShowingMapper || this.isShowingMenu;
  }

  selectedMenuItem(item: string) {
    this.isShowingMenu = false;
    switch (item) {
      case TRIGGER_MENU_OPERATION.CONFIGURE:
        this.isShowingDetails = true;
        break;
      case TRIGGER_MENU_OPERATION.TRIGGER_MAPPING:
        this.isShowingMapper = true;
        break;
      default:
        break;
    }
    this.onMenuItemSelected.emit({operation: item, trigger: this.trigger});
  }
}
