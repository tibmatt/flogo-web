import {Directive, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {AddActivityService} from './add-activity.service';
import {DiagramSelection, DiagramSelectionType} from '@flogo/packages/diagram/interfaces';
import {isEqual} from 'lodash';
import {BUTTON_INSERT_CLASS, SELECTED_INSERT_TILE_CLASS} from '@flogo/core';

@Directive({
  selector: '[fgAddActivity]'
})
export class AddActivityDirective implements OnInit, OnChanges, OnDestroy {

  @Input()
  selection: DiagramSelection;

  constructor(private el: ElementRef, private addTaskService: AddActivityService) {}

  ngOnInit() {
    this.addTaskService.startSubscriptions();
  }

  ngOnChanges({selection}: SimpleChanges) {
    if (selection && !selection.firstChange) {
      const currentSelection = selection.currentValue;
      const previousSelection = selection.previousValue;
      /*************
       * The popover is closed under the following conditions:
       *    1. If there is no currentSelection (when clicked outside)
       *    2. If the current selection is not of type Insert
       *    3. If the current selection and the previous selection are of Insert type and with the same parent taskId
       */
      if (!currentSelection || currentSelection.type !== DiagramSelectionType.Insert || isEqual(currentSelection, previousSelection)) {
        setTimeout(() => {
          this.addTaskService.close();
        }, 0);
      } else {
        /***
         * We are opening the popover with a time delay of 300 ms to let the "add branch" animation to end
         * and allow the popover to get attached to the Insert tile created after an animation.
         */
        setTimeout(() => {
          const selectedInsertTile = this.el.nativeElement.querySelector(`.${SELECTED_INSERT_TILE_CLASS} .${BUTTON_INSERT_CLASS}`);
          this.addTaskService.open(selectedInsertTile, currentSelection.taskId);
        }, 300);
      }
    }
  }

  ngOnDestroy() {
    this.addTaskService.closeAndDestroy();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const popoverRef = this.addTaskService.popoverReference;
    const keepActive = this.addTaskService.shouldKeepPopoverActive;
    if (!keepActive && popoverRef && popoverRef.hasAttached()) {
      const clickTarget = <HTMLElement> event.target;
      const overlayHost = popoverRef.hostElement;
      if (clickTarget !== overlayHost && !overlayHost.contains(clickTarget)) {
        this.addTaskService.cancel();
      }
    }
  }
}
