import {Observable, ReplaySubject} from 'rxjs';
import {map, shareReplay, withLatestFrom} from 'rxjs/operators';
import {isEmpty, filter} from 'lodash';
import {Activity} from '../task-add.component';

export function filterActivitiesBy(sourceList$: Observable<Activity[]>, filterText$: ReplaySubject<string>): Observable<Activity[]> {
  return filterText$.pipe(
    shareReplay(),
    withLatestFrom(sourceList$),
    map(([filterText, activities]) => {
      if (filterText && !isEmpty(filterText)) {
        return filter(activities, (activity: Activity) => activity.title.toLowerCase().indexOf(filterText.toLowerCase()) >= 0);
      } else {
        return activities;
      }
    })
  );
}
