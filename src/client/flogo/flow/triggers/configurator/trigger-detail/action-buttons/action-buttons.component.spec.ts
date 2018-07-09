import {ActionButtonsComponent} from './action-buttons.component';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {NoDependenciesFakeLanguageModule} from '@flogo/core/language/testing';

describe('Component: ActionButtonsComponent', () => {
  let component: ActionButtonsComponent;
  let fixture: ComponentFixture<ActionButtonsComponent>;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NoDependenciesFakeLanguageModule],
      declarations: [ActionButtonsComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ActionButtonsComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    component.status = {
      isDirty: false,
      isPending: false,
      isValid: true
    };
    component.isSaving = false;
  }));

  it('Should show no pending changes by default', () => {
    fixture.detectChanges();
    expect(de.query(By.css('.default-text'))).not.toBeNull();
    expect(de.query(By.css('.buttons'))).toBeNull();
  });

  it('Should show action buttons when there are changes', () => {
    component.status.isDirty = true;
    fixture.detectChanges();
    expect(de.query(By.css('.default-text'))).toBeNull();
    expect(de.query(By.css('.buttons'))).not.toBeNull();
  });

  it('Should disable save button when changes are invalid', () => {
    component.status.isDirty = true;
    component.status.isValid = false;
    fixture.detectChanges();
    const saveEl = de.query(By.css('.action-save'));
    expect(saveEl.nativeElement.disabled).toEqual(true);
  });

  it('Should disable save button when changes are pending', () => {
    component.status.isDirty = true;
    component.status.isPending = true;
    fixture.detectChanges();
    const saveEl = de.query(By.css('.action-save'));
    expect(saveEl.nativeElement.disabled).toEqual(true);
  });

  it('Should disable all action buttons when saving is in progress', () => {
    component.status.isDirty = true;
    component.isSaving = true;
    fixture.detectChanges();
    const saveEl = de.query(By.css('.action-save'));
    const discardEl = de.query(By.css('.action-discard'));
    expect(saveEl.nativeElement.disabled).toEqual(true);
    expect(discardEl.nativeElement.disabled).toEqual(true);
  });
});
