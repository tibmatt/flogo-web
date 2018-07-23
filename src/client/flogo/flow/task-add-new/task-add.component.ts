import {Component, ElementRef, HostListener, Inject, InjectionToken} from '@angular/core';
import {Observable} from 'rxjs';

export interface TaskAddOptions {
  activities: Observable<Activity[]>;
  onSelect: (activityRef: string) => void;
  onClose: () => void;
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

  constructor(@Inject(TASKADD_OPTIONS) public options: TaskAddOptions, private containerRef: ElementRef) {}

  /*@HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    debugger;
    const clickTarget = <HTMLElement> event.target;
    const autocompleteTrigger = this.containerRef.nativeElement;
    if (clickTarget !== autocompleteTrigger && (!autocompleteTrigger.contains(clickTarget))) {
      this.options.onClose();
    }
  }*/

  closePopover() {
    this.options.onClose();
  }
}
