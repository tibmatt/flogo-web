import { Observable, ReplaySubject } from 'rxjs';
import { Injectable, ElementRef } from '@angular/core';
import { WindowRef } from '@flogo-web/lib-client/core';

@Injectable()
export class TogglerRefService {
  private elementRef: ElementRef;
  private panelStatusSrc = new ReplaySubject<boolean>(1);
  panelStatus$: Observable<boolean> = this.panelStatusSrc.asObservable();

  constructor(private windowRef: WindowRef) {}

  getRef(): ElementRef | null {
    return this.elementRef;
  }

  publishPanelStatus(isOpen: boolean) {
    this.panelStatusSrc.next(isOpen);
  }

  registerRef(ref: ElementRef) {
    this.elementRef = ref;
  }

  removeRef() {
    this.elementRef = null;
  }

  calculatePlacement() {
    if (!this.elementRef) {
      return null;
    }
    const element: Element = this.elementRef.nativeElement;
    const nativeWindow = this.windowRef.nativeWindow;
    const boundingRect = element.getBoundingClientRect();
    return {
      minimizedHeight: nativeWindow.innerHeight - boundingRect.top,
      minimizedLeftDistance: boundingRect.left,
    };
  }
}
