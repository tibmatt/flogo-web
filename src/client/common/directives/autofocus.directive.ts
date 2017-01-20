import {AfterContentInit, Directive, Input, ElementRef, Renderer } from '@angular/core';
@Directive({
  selector: '[fgAutofocus]'
})

export class AutofocusDirective implements AfterContentInit {

  @Input()
  shouldAutofocus: boolean = true;

  constructor(private _el: ElementRef, private renderer: Renderer) {
  }

  ngAfterContentInit() {
    if (this.shouldAutofocus) {
      this.renderer.invokeElementMethod(this._el.nativeElement, 'focus');
    }
  }
}
