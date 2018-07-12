import {connect} from './auto-complete.directive';
import {of, Observable} from 'rxjs';
import {SingleEmissionSubject} from '@flogo/flow/shared/mapper/shared/single-emission-subject';
import {async} from '@angular/core/testing';
import {Subject} from 'rxjs/internal/Subject';

describe('AutoCompleteDirective', () => {
  let filterTerm$: Subject<string>;
  let source$: Observable<Observable<string[]>>;
  let destroy$: SingleEmissionSubject;
  let filteredValues$: Observable<string[]>;

  beforeEach(() => {
    filterTerm$ = new Subject<string>();
    source$ = of(of(['Option1', 'Option2', 'Value3', 'Selection4', 'Select5']));
    destroy$ = SingleEmissionSubject.create();
    filteredValues$ = connect(source$, filterTerm$, destroy$);
  });

  afterEach(() => {
    destroy$.emitAndComplete();
  });

  it('Should create the filter observable', () => {
    expect(filteredValues$).toBeTruthy();
  });

  it('Should filter source based on filter term', async(() => {
    filteredValues$.subscribe(filteredValues => {
      expect(filteredValues.length).toEqual(2);
    });
    filterTerm$.next('Option');
  }));

  it('Should filter with case insensitivity', async(() => {
    filteredValues$.subscribe(filteredValues => {
      expect(filteredValues.length).toEqual(2);
    });
    filterTerm$.next('sel');
  }));
});
