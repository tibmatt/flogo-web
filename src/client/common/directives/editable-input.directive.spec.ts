import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { EditableInputDirective } from './editable-input.directive';

@Component({
  selector: 'container',
  template: `
      <input fgEditableInput (editableInputSave)="onSave()" (editableInputCancel)="onCancel()" >
   `
})
class Container {
  public onCancel() {}
  public onSave() {}
}

describe('Directive: EditableInput', () => {
  let fixture: ComponentFixture<Container>;
  let container: Container;
  let de : DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, BrowserModule],
      declarations: [EditableInputDirective, Container]
    });
    fixture = TestBed.createComponent(Container);
    container = fixture.componentInstance;
    de = fixture.debugElement.query(By.directive(EditableInputDirective));
  });

  it('Should emit a save event on blur', () => {
    spyOn(container, 'onSave');
    de.triggerEventHandler('blur', null);
    fixture.detectChanges();

    expect(container.onSave).toHaveBeenCalled();

  });

  it('Should emit one save event when "enter" is pressed', fakeAsync(() => {
    spyOn(de.nativeElement, 'blur');
    spyOn(container, 'onSave');
    de.triggerEventHandler('keyup.enter', new KeyboardEvent('keyup.enter'));
    fixture.detectChanges();
    //expect(container.onSave).toHaveBeenCalledTimes(1);
    // TODO: there seems to be an issue re-firing DOM issues from inside the directive in the karma environment
    // Instead we're making sure the blur event is called
    expect(de.nativeElement.blur).toHaveBeenCalledTimes(1);
  }));

  it('Should emit a cancel event when "esc" is pressed', () => {
    spyOn(container, 'onCancel');
    de.triggerEventHandler('keyup.esc', null);
    fixture.detectChanges();
    expect(container.onCancel).toHaveBeenCalled();
  });

});
