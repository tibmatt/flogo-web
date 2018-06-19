import { isArray } from 'lodash';
import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener, Inject,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChange,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { TAB } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { map, shareReplay, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';
import { of as observableOf } from 'rxjs/observable/of';
import { concat } from 'rxjs/observable/concat';

import { AUTOCOMPLETE_OPTIONS, AutoCompleteContentComponent, AutocompleteOptions } from './auto-complete-content.component';
import { SingleEmissionSubject } from '@flogo/core/models';

const POPOVER_WIDTH = '344px';
// note: needs to be in sync with the max-height in the stylesheet auto-complete-content.component.less
// const POPOVER_MAX_HEIGHT = '436px';

const ensureObservable = (value) => {
  if (!value) {
    return observableOf([]);
  } else if (isArray(value)) {
    return observableOf(value);
  }
  return value;
};

const filterList = (collection, term) => {
  term = term ? term.toLowerCase() : '';
  if (!term) {
    return collection;
  }
  return collection.filter(element => element.toLowerCase().startsWith(term));
};

@Directive({
  selector: '[fgTriggersConfigAutoComplete]'
})
export class AutoCompleteDirective implements OnChanges, OnInit, OnDestroy {

  @Input() formControl: AbstractControl;
  @Input() autoCompleteAllowedSource: Observable<string[]> | string[];
  @Input() autoCompleteVariablesSource: Observable<string[]> | string[];
  isOpen = false;

  popoverRef: OverlayRef;
  contentPortal: ComponentPortal<AutoCompleteContentComponent>;
  popoverComponentRef: ComponentRef<AutoCompleteContentComponent>;

  private variablesSources = new ReplaySubject<Observable<string[]>>(1);
  private allowedValuesSources = new ReplaySubject<Observable<string[]>>(1);
  private valueSources = new ReplaySubject<Observable<string[]>>(1);

  private filteredAllowedValues$: Observable<string[]>;
  private fileteredVariableOptions$: Observable<string[]>;

  private destroy$ = SingleEmissionSubject.create();

  constructor(
    private containerRef: ElementRef,
    private parentInjector: Injector,
    private overlay: Overlay,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit() {
    const switchToInner = switchMap<Observable<string[]>, string[]>(newValueSource => newValueSource);
    const mapToFiltered = map(([currentInputValue, allowedValues]) => filterList(allowedValues, currentInputValue));
    const value$ = this.valueSources.pipe(switchToInner, shareReplay());
    const connect = (subjectSrc: Observable<Observable<string[]>>) => value$.pipe(
      takeUntil(this.destroy$),
      withLatestFrom(subjectSrc.pipe(switchToInner)),
      mapToFiltered,
    );
    this.filteredAllowedValues$ = connect(this.allowedValuesSources);
    this.fileteredVariableOptions$ = connect(this.variablesSources);
  }

  @HostListener('focus')
  onFocus() {
    this.open();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.popoverRef || !this.popoverRef.hasAttached) {
      return;
    }
    const clickTarget = <HTMLElement> event.target;
    const autocompleteTrigger = this.containerRef.nativeElement;
    if (clickTarget !== autocompleteTrigger && (this.popoverRef && !this.popoverRef.overlayElement.contains(clickTarget))) {
      this.close();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.popoverRef || !this.popoverRef.hasAttached) {
      return;
    }
    const keyCode = event.keyCode;
    if (keyCode === TAB) {
      this.close();
    }
  }

  ngOnChanges(changes: { [P in keyof this]?: SimpleChange }) {
    if (changes.formControl) {
      this.valueSources.next(concat(
        observableOf(this.formControl.value),
        this.formControl.valueChanges,
      ));
    }
    if (changes.autoCompleteAllowedSource) {
      this.allowedValuesSources.next(ensureObservable(this.autoCompleteAllowedSource));
    }
    if (changes.autoCompleteVariablesSource) {
      this.variablesSources.next(ensureObservable(this.autoCompleteVariablesSource));
    }
  }

  ngOnDestroy() {
    if (this.popoverRef) {
      this.close();
      this.popoverRef.dispose();
      this.popoverRef = null;
    }
    this.destroy$.emitAndComplete();
  }

  private close() {
    if (this.popoverRef && this.popoverRef.hasAttached()) {
      this.popoverRef.detach();
    }
    if (this.contentPortal && this.contentPortal.isAttached) {
      this.contentPortal.detach();
    }
  }

  private open() {
    if (!this.contentPortal) {
      this.contentPortal = this.createPortal();
    }

    if (!this.popoverRef) {
      this.popoverRef = this.overlay.create({
        width: POPOVER_WIDTH,
        // height: POPOVER_MAX_HEIGHT,
        // maxHeight: POPOVER_MAX_HEIGHT,
        positionStrategy: this.overlay
          .position()
          .connectedTo(
            this.containerRef,
            { originX: 'start', originY: 'bottom' },
            { overlayX: 'start', overlayY: 'top' }
          )
      });
    }

    if (!this.popoverRef.hasAttached()) {
      this.popoverComponentRef = this.popoverRef.attach(this.contentPortal);
    }
  }

  private optionSelected(option: string) {
    this.formControl.setValue(option);
    this.close();
  }

  private createPortal() {
    const sources: AutocompleteOptions = {
      allowedValues: this.filteredAllowedValues$,
      appVariables: this.fileteredVariableOptions$,
      onOptionSelected: (option) => this.optionSelected(option)
    };
    const injector = new PortalInjector(this.parentInjector, new WeakMap<any, any>([ [AUTOCOMPLETE_OPTIONS, sources] ]));
    return new ComponentPortal(AutoCompleteContentComponent, null, injector);
  }

}
