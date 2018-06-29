import { isArray, isString } from 'lodash';
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
  Optional,
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
import { SettingValue } from '@flogo/flow/triggers/configurator/trigger-detail/settings-value';
import { FieldValueAccesorDirective } from '@flogo/flow/triggers/configurator/trigger-detail/settings/form-field/field.directive';

const POPOVER_WIDTH = '344px';

const ensureObservable = (value) => {
  if (!value) {
    return observableOf([]);
  } else if (isArray(value)) {
    return observableOf(value);
  }
  return value;
};

const filterList = (collection: string[], term: string) => {
  term = term ? term.toLowerCase() : '';
  if (!term) {
    return collection;
  }
  return collection.filter(element => element.toLowerCase().startsWith(term));
};

const coerceSettingValueToString = (settingValue: SettingValue) => isString(settingValue.viewValue)
  ? settingValue.viewValue
  : JSON.stringify(settingValue.viewValue);

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

  private filterTerm$: Observable<string>;
  private filteredAllowedValues$: Observable<string[]>;
  private fileteredVariableOptions$: Observable<string[]>;

  private destroy$ = SingleEmissionSubject.create();

  constructor(
    private containerRef: ElementRef,
    private parentInjector: Injector,
    private overlay: Overlay,
    @Inject(DOCUMENT) private document: Document,
    @Optional() private valueAccessor: FieldValueAccesorDirective,
  ) {
  }

  ngOnInit() {
    const switchToInner = switchMap<Observable<any>, any>(newValueSource => newValueSource);
    const mapToFiltered = map(([currentInputValue, allowedValues]) => filterList(allowedValues, currentInputValue));
    this.filterTerm$ = this.valueSources.pipe(
      switchToInner,
      map((value: string | SettingValue) => !isString(value) ? coerceSettingValueToString(value) : value),
      shareReplay()
    );
    const connect = (subjectSrc: Observable<Observable<string[]>>) => this.filterTerm$.pipe(
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
        scrollStrategy: this.getScrollStrategy(),
        positionStrategy: this.getPositionStrategy(),
      });
    }

    if (!this.popoverRef.hasAttached()) {
      this.popoverComponentRef = this.popoverRef.attach(this.contentPortal);
    }
  }

  private getScrollStrategy() {
    return this.overlay
      .scrollStrategies
      .reposition();
  }

  private getPositionStrategy() {
    return this.overlay
      .position()
      .connectedTo(
        this.containerRef,
        { originX: 'start', originY: 'bottom' },
        { overlayX: 'start', overlayY: 'top' }
      )
      .withFallbackPosition(
        {originX: 'start', originY: 'top'}, {overlayX: 'start', overlayY: 'bottom'}
      );
  }

  private optionSelected(option: string) {
    this.formControl.setValue(option);
    if (this.valueAccessor) {
      this.valueAccessor.update(option);
    }
    this.close();
  }

  private createPortal() {
    const sources: AutocompleteOptions = {
      filterTerm: this.filterTerm$,
      allowedValues: this.filteredAllowedValues$,
      appVariables: this.fileteredVariableOptions$,
      onOptionSelected: (option) => this.optionSelected(option)
    };
    const injector = new PortalInjector(this.parentInjector, new WeakMap<any, any>([ [AUTOCOMPLETE_OPTIONS, sources] ]));
    return new ComponentPortal(AutoCompleteContentComponent, null, injector);
  }

}
