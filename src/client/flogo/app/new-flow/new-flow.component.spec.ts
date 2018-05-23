import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { BsModalModule } from 'ng2-bs3-modal';

import { APIFlowsService } from '../../core/services/restapi/v2/flows-api.service';
import { SharedModule as FlogoSharedModule } from '../../shared/shared.module';
import { CoreModule as FlogoCoreModule } from '../../core/core.module';
import { FlogoNewFlowComponent } from './new-flow.component';
import { FakeRootLanguageModule } from '@flogo/core/language/testing';

const EXISTING_FLOW_NAME = 'existing';
const flowsServiceStub = {

  findFlowsByName(name: string) {
    let flowArr = [];
    if (name === EXISTING_FLOW_NAME) {
      flowArr = [{ id: '123', name: EXISTING_FLOW_NAME }];
    }
    return Promise.resolve(flowArr);
  }

};

describe('Component: FlogoNewFlow', () => {
  let component: FlogoNewFlowComponent;
  let fixture: ComponentFixture<FlogoNewFlowComponent>;
  let elements: { submitBtn: DebugElement, nameInput: DebugElement, descriptionInput: DebugElement };

  let submitBtn: DebugElement;

  beforeEach((done) => {
    TestBed.configureTestingModule({
      imports: [
        FakeRootLanguageModule,
        BsModalModule,
        FlogoCoreModule,
        FlogoSharedModule
      ],
      declarations: [
        FlogoNewFlowComponent
      ], // declare the test component
      providers: [
        { provide: APIFlowsService, useValue: flowsServiceStub },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents()
      .then(() => done());

  });

  beforeEach(async(() => {

    fixture = TestBed.createComponent(FlogoNewFlowComponent);
    component = fixture.componentInstance;

    const openModalBtnDe = fixture.debugElement.query(By.css('.js-open-modal'));
    openModalBtnDe.triggerEventHandler('click', null);

    fixture.detectChanges();

    elements = {
      submitBtn: fixture.debugElement.query(By.css('[type="submit"]')),
      nameInput: fixture.debugElement.query(By.css('#flowName')),
      descriptionInput: fixture.debugElement.query(By.css('#flowDescription')),
    };

    submitBtn = fixture.debugElement.query(By.css('[type="submit"]'));

  }));

  afterEach((done) => {
    return component.modal.close()
      .then(() => done());
  });

  it('Should not allow save when flow name is not provided', async(() => {
    fixture.detectChanges();
    expect(component.flow.valid).toBe(false, 'form is valid');
    expect(submitBtn.nativeElement.disabled).toBe(true);
  }));

  it('Should not allow to save when flow name already exists', async(() => {
    setValueAndDispatch(EXISTING_FLOW_NAME, elements.nameInput);
    fixture.detectChanges();
    expect(component.flow.valid).toBe(false, 'form is valid');
    expect(submitBtn.nativeElement.disabled).toBeTruthy();
  }));

  it('Should trigger an event with the flow info when the save button is clicked', async(() => {

    spyOn(component.newFlow, 'emit');
    const testFlow = {
      name: 'new flow name',
      description: 'new flow description'
    };

    setValueAndDispatch(testFlow.name, elements.nameInput);
    fixture.detectChanges();

    return fixture.whenStable()
      .then(() => {
        setValueAndDispatch(testFlow.description, elements.descriptionInput);
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        expect(component.flow.valid).toBe(true, 'form is invalid');
        expect(submitBtn.nativeElement.disabled).toBeFalsy('Submit button is not enabled');
        submitBtn.nativeElement.click();
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        const [mostRecentCallParams] = (<jasmine.Spy>component.newFlow.emit).calls.mostRecent().args;
        const { name, description } = mostRecentCallParams;
        expect(component.newFlow.emit).toHaveBeenCalledTimes(1);
        expect({ name, description }).toEqual(testFlow);
      });
  }));

  function setValueAndDispatch(value: any, de: DebugElement) {
    const nativeElement = de.nativeElement;
    nativeElement.value = value;
    nativeElement.dispatchEvent(new Event('input'));
  }

});

