import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { AutofocusDirective } from './autofocus.directive';

@Component({
  selector: 'container',
  template: `

<div [ngSwitch]="caseName">
    <input  *ngSwitchDefault  type="text" fgAutofocus id="inputNoBind" />
    <input  *ngSwitchCase="'bindTrue'"  type="text" fgAutofocus [shouldAutofocus]="shouldAutofocus" id="inputBindTrue" />
    <input  *ngSwitchCase="'bindFalse'" type="text" fgAutofocus [shouldAutofocus]="shouldAutofocus" id="inputBindFalse" />
</div>
   `
})
class Container {
  public caseName : string;
  public shouldAutofocus : boolean;
}

describe('Directive: fgAutofocus ', () => {
  let fixture: ComponentFixture<Container>;
  let container : Container;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, BrowserModule],
      declarations: [AutofocusDirective, Container]
    });
    fixture = TestBed.createComponent(Container);
    container = fixture.componentInstance;
  });


  it('The input control should have the focus when the input initializes', () => {
    fixture.detectChanges();
    expect(document.activeElement.id).toEqual('inputNoBind');
  });

  it('The input control should not have the focus when the binding is false', () => {
    container.caseName = 'bindFalse';
    container.shouldAutofocus = false;
    fixture.detectChanges();

    expect(document.activeElement.id).not.toEqual('inputBindFalse');
  });

  it('The input control should have the focus when the binding is true', () => {
    container.caseName = 'bindTrue';
    container.shouldAutofocus = true;
    fixture.detectChanges();

    expect(document.activeElement.id).toEqual('inputBindTrue');
  });

});
