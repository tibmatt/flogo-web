import { ComponentFixture, TestBed, fakeAsync, tick, async, inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { BsModalModule, BsModalService } from 'ng2-bs3-modal';

import { PostService } from '../../core/services/post.service';
import { APIFlowsService } from '../../core/services/restapi/v2/flows-api.service';
import { SharedModule as FlogoSharedModule } from '../../shared/shared.module';
import { CoreModule as FlogoCoreModule } from '../../core/core.module';
import { PUB_EVENTS } from './message';
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

const postServiceStub = {

  publish(data: any) {
    this.published = data;
  }

};

describe('Component: FlogoNewFlow', () => {
  let comp: FlogoNewFlowComponent;
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
        { provide: PostService, useValue: postServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents()
      .then(() => done());

  });

  beforeEach(async(() => {

    fixture = TestBed.createComponent(FlogoNewFlowComponent);
    comp = fixture.componentInstance;

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
    return comp.modal.close()
      .then(() => done());
  });

  it('Should not allow save when flow name is not provided', async(() => {
    fixture.detectChanges();
    expect(comp.flow.valid).toBe(false, 'form is valid');
    expect(submitBtn.nativeElement.disabled).toBe(true);
  }));

  it('Should not allow to save when flow name already exists', async(() => {
    setValueAndDispatch(EXISTING_FLOW_NAME, elements.nameInput);
    fixture.detectChanges();
    expect(comp.flow.valid).toBe(false, 'form is valid');
    expect(submitBtn.nativeElement.disabled).toBeTruthy();
  }));

  it('Should trigger an event with the flow info when the save button is clicked', async(() => {

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
        expect(comp.flow.valid).toBe(true, 'form is invalid');
        expect(submitBtn.nativeElement.disabled).toBeFalsy('Submit button is not enabled');
        submitBtn.nativeElement.click();
        fixture.detectChanges();
        return fixture.whenStable();
      })
      .then(() => {
        const postServiceStubInstance = <any> fixture.debugElement.injector.get(PostService);

        expect(postServiceStubInstance.published).toBeDefined('Published message is not defined');
        expect(postServiceStubInstance.published.channel).toBe(PUB_EVENTS.addFlow.channel);
        expect(postServiceStubInstance.published.topic).toBe(PUB_EVENTS.addFlow.topic);

        const messageData = postServiceStubInstance.published.data;
        expect(messageData.name).toBe(testFlow.name);
        expect(messageData.description).toBe(testFlow.description);
      });
  }));

  function setValueAndDispatch(value: any, de: DebugElement) {
    const nativeElement = de.nativeElement;
    nativeElement.value = value;
    nativeElement.dispatchEvent(new Event('input'));
  }


});

