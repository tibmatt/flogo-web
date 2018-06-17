import { pipe } from 'rxjs/util/pipe';
import { distinctUntilChanged, map, skip } from 'rxjs/operators';
import { MapperState } from '../../models';

export const selectMapperStatus = pipe(
  map((state: MapperState) => ({isDirty: state.isDirty, isValid: state.isValid})),
  skip(1),
  // tslint:disable-next-line:triple-equals -- "truthy" and "falsy" values are okay
  distinctUntilChanged((prev, next) => prev.isDirty == next.isDirty && prev.isValid == next.isValid),
);
