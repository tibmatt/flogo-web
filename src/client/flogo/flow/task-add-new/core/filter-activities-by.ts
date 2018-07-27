import {Observable, ReplaySubject} from 'rxjs';
import {map, shareReplay, withLatestFrom} from 'rxjs/operators';
import {isEmpty, filter} from 'lodash';
import {Activity} from '../task-add.component';

const filterList = (activities, filterText) => {
  if (filterText && !isEmpty(filterText)) {
    return filter(activities, (activity: Activity) => activity.title.toLowerCase().indexOf(filterText.toLowerCase()) >= 0);
  } else {
    return activities;
  }
};

export function filterActivitiesBy(sourceList$: Observable<Activity[]>, filterText$: ReplaySubject<string>): Observable<Activity[]> {
  const mapTo = map(([searchTerm, activityList]) => filterList(activityList, searchTerm));
  return filterText$.pipe(
    shareReplay(),
    withLatestFrom(sourceList$),
    mapTo
  );
}
