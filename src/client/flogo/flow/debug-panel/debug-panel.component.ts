import { Component, ElementRef, ViewChild } from '@angular/core';
import { debugPanelAnimations } from './debug-panel.animations';
import { AnimationEvent } from '@angular/animations';

const SELECTED_SELECTOR = 'flogo-diagram-tile-task.is-selected';

@Component({
  selector: 'flogo-flow-debug-panel',
  templateUrl: './debug-panel.component.html',
  styleUrls: ['./debug-panel.component.less'],
  animations: [debugPanelAnimations.transformPanel],
})
export class DebugPanelComponent {

  @ViewChild('content') content: ElementRef;
  isOpen = null;

  togglePanel() {
    this.isOpen = !this.isOpen ? 'open' : null;
  }

  onAnimationEnd(event: AnimationEvent) {
    if (event.toState === 'open') {
      this.scrollContextElementIntoView();
    }
  }

  private scrollContextElementIntoView() {
    const contentElement: Element = this.content.nativeElement;
    const selection = contentElement.querySelector(SELECTED_SELECTOR);
    if (selection) {
      selection.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
