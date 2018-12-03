import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Observable } from 'rxjs/index';

const filterList = (collection: string[], term: string) => {
  term = term ? term.toLowerCase() : '';
  if (!term) {
    return collection;
  }
  return collection.filter(element => element.toLowerCase().startsWith(term));
};

export function filterSourceBy(subjectSrc: Observable<Observable<string[]>>, filterTerm$: Observable<string>) {
  const mapToFiltered = map(([currentInputValue, allowedValues]) => filterList(allowedValues, currentInputValue));
  return filterTerm$.pipe(
    withLatestFrom(subjectSrc.pipe(switchMap<Observable<any>, any>(newValueSource => newValueSource))),
    mapToFiltered
  );
}
