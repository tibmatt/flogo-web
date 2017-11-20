import { AfterContentInit, Directive, ElementRef, Input, Renderer } from '@angular/core';

@Directive({
  selector: '[fgAutofocus]'
})

export class AutofocusDirective implements AfterContentInit {

  @Input()
  shouldAutofocus = true;

  constructor(private _el: ElementRef, private renderer: Renderer) {
  }

  ngAfterContentInit() {
    if (this.shouldAutofocus) {
      this.renderer.invokeElementMethod(this._el.nativeElement, 'focus');
    }
  }
}
