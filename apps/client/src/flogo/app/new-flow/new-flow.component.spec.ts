import { of } from 'rxjs';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';

import { CoreModule as FlogoCoreModule, ResourceService } from '@flogo-web/client-core';
import { MODAL_TOKEN, ModalControl } from '@flogo-web/client-core/modal';
import { FakeRootLanguageModule } from '@flogo-web/client-core/language/testing';

import { SharedModule as FlogoSharedModule } from '@flogo-web/client-shared';
import { FlogoNewFlowComponent, NewFlowData } from './new-flow.component';

const EXISTING_FLOW_NAME = 'existing';
const resourceServiceStub: {
  listResourcesWithName: ResourceService['listResourcesWithName'];
} = {
  listResourcesWithName(name: string) {
    let flowArr = [];
    if (name === EXISTING_FLOW_NAME) {
      flowArr = [{ id: '123', name: EXISTING_FLOW_NAME }];
    }
    return of(flowArr);
  },
};

const newFlowDataStub: NewFlowData = {
  appId: 'app1',
  triggerId: 'trigger1',
};

const modalControlStub = {
  close() {
    return {};
  },
};

describe('Component: FlogoNewFlow', () => {
  let component: FlogoNewFlowComponent;
  let fixture: ComponentFixture<FlogoNewFlowComponent>;
  let elements: {
    submitBtn: DebugElement;
    nameInput: DebugElement;
    descriptionInput: DebugElement;
  };

  let submitBtn: DebugElement;

  beforeEach(done => {
    TestBed.configureTestingModule({
      imports: [FakeRootLanguageModule, FlogoCoreModule, FlogoSharedModule],
      declarations: [FlogoNewFlowComponent], // declare the test component
      providers: [
        { provide: ResourceService, useValue: resourceServiceStub },
        { provide: ModalControl, useValue: modalControlStub },
        { provide: MODAL_TOKEN, useValue: newFlowDataStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => done());
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlogoNewFlowComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    elements = {
      submitBtn: fixture.debugElement.query(By.css('[type="submit"]')),
      nameInput: fixture.debugElement.query(By.css('#flowName')),
      descriptionInput: fixture.debugElement.query(By.css('#flowDescription')),
    };

    submitBtn = fixture.debugElement.query(By.css('[type="submit"]'));
  });

  afterEach(() => {
    return component.closeAddFlowModal();
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
    spyOn(component.control, 'close');
    const testFlow = {
      name: 'new flow name',
      description: 'new flow description',
    };

    setValueAndDispatch(testFlow.name, elements.nameInput);
    fixture.detectChanges();

    return fixture
      .whenStable()
      .then(() => {
        setValueAndDispatch(testFlow.description, elements.descriptionInput);
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        expect(component.flow.valid).toBe(true, 'form is invalid');
        expect(submitBtn.nativeElement.disabled).toBeFalsy(
          'Submit button is not enabled'
        );
        submitBtn.nativeElement.click();
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        const [mostRecentCallParams] = (<jasmine.Spy>(
          component.control.close
        )).calls.mostRecent().args;
        const { name, description } = mostRecentCallParams;
        expect(component.control.close).toHaveBeenCalledTimes(1);
        expect({ name, description }).toEqual(testFlow);
      });
  }));

  function setValueAndDispatch(value: any, de: DebugElement) {
    const nativeElement = de.nativeElement;
    nativeElement.value = value;
    nativeElement.dispatchEvent(new Event('input'));
  }
});
