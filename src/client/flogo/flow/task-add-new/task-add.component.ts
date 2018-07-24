import {Component, ElementRef, Inject, InjectionToken} from '@angular/core';
import {Observable} from 'rxjs';

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
export class TaskAddComponent {

  constructor(@Inject(TASKADD_OPTIONS) public options: TaskAddOptions) {}
}
