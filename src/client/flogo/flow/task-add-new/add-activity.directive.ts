import {Directive, ElementRef, HostListener, OnDestroy, OnInit} from '@angular/core';
import {AddActivityService} from './add-activity.service';
import {BUTTON_INSERT_CLASS, SELECTED_INSERT_TILE_CLASS} from '@flogo/core';

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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const popoverRef = this.addTaskService.popoverReference;
    if (popoverRef && popoverRef.hasAttached()) {
      const clickTarget = <HTMLElement> event.target;
      const overlayHost = popoverRef.hostElement;
      const currentInsertEl = this.el.nativeElement.querySelector(`.${SELECTED_INSERT_TILE_CLASS} .${BUTTON_INSERT_CLASS}`);
      if (!currentInsertEl || (clickTarget !== currentInsertEl && !currentInsertEl.contains(clickTarget)
        && clickTarget !== overlayHost && !overlayHost.contains(clickTarget))) {
        this.addTaskService.closeAndClearSelection();
      }
    }
  }
}
