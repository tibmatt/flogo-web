import {Directive, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {AddActivityService} from './add-activity.service';

@Directive({
  selector: '[fgAddActivity]'
})
export class AddActivityDirective implements OnInit, OnDestroy {

  constructor(private el: ElementRef, private addTaskService: AddActivityService) {}

  ngOnInit() {
    this.addTaskService.startSubscriptions();
  }

  ngOnDestroy() {
    this.addTaskService.closeAndDestroy();
  }
}
