import { Injectable, ElementRef } from '@angular/core';
import { WindowRef } from '@flogo-web/client/core/services';

@Injectable()
export class TogglerRefService {
  private elementRef: ElementRef;

  constructor(private windowRef: WindowRef) {}

  getRef(): ElementRef | null {
    return this.elementRef;
  }

  registerRef(ref: ElementRef) {
    this.elementRef = ref;
  }

  removeRef() {
    this.elementRef = null;
  }

  getBottomDistance() {
    if (!this.elementRef) {
      return null;
    }
    const element: Element = this.elementRef.nativeElement;
    return this.windowRef.nativeWindow.innerHeight - element.getBoundingClientRect().top;
  }
}
