import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { Component }    from '@angular/core';
import { Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { FlowsModule as FlogoFlowsModule } from '../../flogo.flows/flogo.flows.module';
import { CommonModule as FlogoCommonModule } from '../../../common/common.module';
import { CoreModule as FlogoCoreModule } from '../../../common/core.module';
import {  FlogoFormBuilderFieldsTextArea } from './fields.textarea/fields.textarea.component';


@Component({
  selector: 'container',
  template: `
            <flogo-form-builder-fields-textarea [info]="info" [fieldObserver]="fieldObserver"></flogo-form-builder-fields-textarea>
            `
})
class Container {
  info: any;
  fieldObserver:ReplaySubject<any>;

  constructor() {
    this.fieldObserver = new ReplaySubject(2);
    this.info = {
      control: 'FieldTextBox',
      required: false,
      direction: 'input',
      isBranch: false,
      isTask: false,
      isTrigger: true,
      value: 'invalid JSON value'
    }
  }
}

describe('Form-builder component', () => {
  let comp: Container;
  let fixture: ComponentFixture<Container>;

  function createComponent() {
    return TestBed.compileComponents();
  }

  beforeEach(done => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          provide: TranslateLoader,
          useFactory: (http: Http) => new TranslateStaticLoader(http, '/base/dist/public/assets/i18n', '.json'),
          deps: [Http],
        }),
        FlogoCoreModule,
        FlogoCommonModule,
        FlogoFlowsModule
      ],
      declarations: [
        FlogoFormBuilderFieldsTextArea,
        Container,
      ], // declare the test component
      providers: [
      ],
      //  schemas: [ NO_ERRORS_SCHEMA ]
    })
      .compileComponents()
      .then(() => done());
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Container);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should throw error when the control is displayed for first time and it has an invalid JSON value', fakeAsync(() => {
    comp.fieldObserver.subscribe((result: any) => {
      if(result.message === 'validation') {
        fixture.detectChanges();
        let textarea = fixture.nativeElement.querySelector('textarea');
        expect(textarea.classList).toContain('error');
      }
    });

    fixture.detectChanges();
    tick();
  }));

  it('Should throw error when value of input field is not a valid JSON', fakeAsync(() => {
    comp.fieldObserver.subscribe((result: any) => {
      if(result.message === 'validation') {
        fixture.detectChanges();
        let textarea = fixture.nativeElement.querySelector('textarea');
        expect(textarea.classList).toContain('error');
      }
    });

    fixture.detectChanges();
    let textarea = fixture.nativeElement.querySelector('textarea');
    textarea.value = 'invalid JSON value';

    let evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    textarea.dispatchEvent(evt);
    tick();
  }));

  it('Should not throw error when user clear the value', fakeAsync(() => {
    comp.fieldObserver.subscribe((result: any) => {
      if(result.message === 'validation') {
        fixture.detectChanges();
        let textarea = fixture.nativeElement.querySelector('textarea');
        expect(textarea.classList).not.toContain('error');
      }
    });

    fixture.detectChanges();
    let textarea = fixture.nativeElement.querySelector('textarea');
    textarea.value = '';

    let evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    textarea.dispatchEvent(evt);
    tick();
  }));

  it('Should clear the error when user enters a valid JSON', fakeAsync(() => {
    comp.fieldObserver.subscribe((result: any) => {
      if(result.message === 'validation') {
        fixture.detectChanges();
        let textarea = fixture.nativeElement.querySelector('textarea');
        expect(textarea.classList).not.toContain('error');
      }
    });
    fixture.detectChanges();
    let textarea = fixture.nativeElement.querySelector('textarea');
    textarea.value = '{"color": "blue"}';

    let evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    textarea.dispatchEvent(evt);
    debugger;
    tick();
  }));

});

