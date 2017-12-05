import { Component, DebugElement, EventEmitter, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ContenteditableDirective } from './contenteditable.directive';
import { SanitizeService } from '../../core/services/sanitize.service';

@Component({
  selector: 'flogo-test-container',
  template: `
            <h3 [(fgContentEditable)]="name"
            (fgContentEditableChange)="changed($event,null)"></h3>
            `
})
class ContainerComponent {
  @Output() changes = new EventEmitter();
  name = '';

  // helper function to repeat the event propagation
  changed(value, property) {
    this.changes.emit(value);
  }
}

describe('Directive: ContenteditableDirective', () => {
  let fixture: ComponentFixture<ContainerComponent>;
  let de: DebugElement;
  let container: ContainerComponent;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SanitizeService],
      declarations: [ContenteditableDirective, ContainerComponent]
    });
  });


  it('Changing the model variable should change the inner text', () => {
    fixture = TestBed.createComponent(ContainerComponent);
    container = fixture.componentInstance;
    de = fixture.debugElement.query(By.directive(ContenteditableDirective));
    element = de.nativeElement;
    container.name = 'a new name';
    fixture.detectChanges();
    expect(element.innerText).toBe('a new name');
  });

  it('Blur event should emit the edited value', done => {
    fixture = TestBed.createComponent(ContainerComponent);
    container = fixture.componentInstance;
    fixture.detectChanges();

    const h3Debug = fixture.debugElement.query(By.directive(ContenteditableDirective));

    container.changes.subscribe(value => {
      expect(value).toEqual('A new value');
      done();
    });

    const h3Element = h3Debug.nativeElement;
    h3Debug.triggerEventHandler('focus', null);
    fixture.detectChanges();
    h3Element.innerHTML = 'A new value';
    h3Debug.triggerEventHandler('blur', null);
    fixture.detectChanges();

  });
});

