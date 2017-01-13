import {Directive, ElementRef, Renderer, AfterContentInit} from '@angular/core';
@Directive({
  selector: '[doFocus]'
})

export class DoFocusDirective implements AfterContentInit {

  constructor(private _el: ElementRef, private renderer: Renderer) {
  }

  ngAfterContentInit() {
    this.renderer.invokeElementMethod(this._el.nativeElement, 'focus');
  }
}
