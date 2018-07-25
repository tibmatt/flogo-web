import { Component, Inject, InjectionToken, OnInit} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {filterActivitiesBy} from './filter-activities-by';

export interface TaskAddOptions {
  activities: Observable<Activity[]>;
  onSelect: (activityRef: string) => void;
}

export interface Activity {
  title: string;
  ref: string;
}

export const TASKADD_OPTIONS = new InjectionToken<TaskAddOptions>('flogo-flow-task-add');

@Component({
  templateUrl: 'task-add.component.html',
  styleUrls: ['task-add.component.less']
})
export class TaskAddComponent implements OnInit {

  filteredActivities$: Observable<Activity[]>;
  filterText$: ReplaySubject<string>;

  constructor(@Inject(TASKADD_OPTIONS) public options: TaskAddOptions) {
    this.filterText$ = new ReplaySubject<string>(1);
  }

  ngOnInit() {
    this.filteredActivities$ = filterActivitiesBy(this.options.activities, this.filterText$);
    this.filterText$.next('');
  }

  filterActivities(term: string) {
    this.filterText$.next(term);
  }
}
