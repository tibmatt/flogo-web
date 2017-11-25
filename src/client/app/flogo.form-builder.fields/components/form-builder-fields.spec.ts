import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { FlowsModule as FlogoFlowsModule } from '../../flogo.flows/flogo.flows.module';
import { SharedModule as FlogoSharedModule } from '../../shared/shared.module';
import { CoreModule as FlogoCoreModule } from '../../core/core.module';
import { FlogoFormBuilderFieldsTextAreaComponent } from './fields.textarea/fields.textarea.component';
import { FlogoFormBuilderFieldsTextBoxComponent } from './fields.textbox/fields.textbox.component';
import { FlogoFormBuilderFieldsNumberComponent } from './fields.number/fields.number.component';
import { FlogoFormBuilderFieldsObjectComponent } from './fields.object/fields.object.component';

@Component({
  template: `<flogo-form-builder-fields-textarea [info]="info" [fieldObserver]="fieldObserver">
  </flogo-form-builder-fields-textarea>`
})
class TextareaTestHostComponent {
  info: any;
  fieldObserver: ReplaySubject<any>;

  constructor() {
    this.fieldObserver = new ReplaySubject(2);
    this.info = {
      control: 'FieldTextArea',
      required: false,
      direction: 'input',
      isBranch: false,
      isTask: false,
      isTrigger: true,
      value: 'invalid JSON value'
    };
  }
}

@Component({
  template: `
            <flogo-form-builder-fields-textbox [info]="info" [fieldObserver]="fieldObserver"></flogo-form-builder-fields-textbox>
            `
})
class TextboxTestHostComponent {
  info: any;
  fieldObserver: ReplaySubject<any>;

  constructor() {
    this.fieldObserver = new ReplaySubject(2);
    this.info = {
      control: 'FieldTextBox',
      required: true,
      direction: 'input',
      isBranch: false,
      isTask: false,
      isTrigger: true,
      value: 'hello world'
    };
  }
}


@Component({
  template: `
            <flogo-form-builder-fields-object [info]="info" [fieldObserver]="fieldObserver"></flogo-form-builder-fields-object>
            `
})
class ObjectTestHostComponent {
  info: any;
  fieldObserver: ReplaySubject<any>;

  constructor() {
    this.fieldObserver = new ReplaySubject(2);
    this.info = {
      control: 'FieldObject',
      required: true,
      direction: 'input',
      isBranch: false,
      isTask: false,
      isTrigger: true,
      value: { message: 'hello' }
    };
  }
}


@Component({
  template: `
            <flogo-form-builder-fields-number [info]="info" [fieldObserver]="fieldObserver"></flogo-form-builder-fields-number>
            `
})
class NumberTestHostComponent {
  info: any;
  fieldObserver: ReplaySubject<any>;

  constructor() {
    this.fieldObserver = new ReplaySubject(2);
    this.info = {
      control: 'FieldNumber',
      required: true,
      direction: 'input',
      isBranch: false,
      isTask: false,
      isTrigger: true,
      value: 10
    };
  }
}

describe('Form-builder component', () => {
  let compTextArea: TextareaTestHostComponent;
  let fixtureTextarea: ComponentFixture<TextareaTestHostComponent>;

  let compTextbox: TextareaTestHostComponent;
  let fixtureTextbox: ComponentFixture<TextboxTestHostComponent>;

  let compNumber: NumberTestHostComponent;
  let fixtureNumber: ComponentFixture<NumberTestHostComponent>;


  let compObject: ObjectTestHostComponent;
  let fixtureObject: ComponentFixture<ObjectTestHostComponent>;

  function createComponent() {
    return TestBed.compileComponents();
  }

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
  });

  beforeEach(done => {
    TestBed.configureTestingModule({
      imports: [
        FlogoCoreModule,
        FlogoSharedModule,
        FlogoFlowsModule
      ],
      declarations: [
        FlogoFormBuilderFieldsTextAreaComponent,
        FlogoFormBuilderFieldsTextBoxComponent,
        FlogoFormBuilderFieldsNumberComponent,
        FlogoFormBuilderFieldsObjectComponent,
        TextareaTestHostComponent,
        NumberTestHostComponent,
        ObjectTestHostComponent,
        TextboxTestHostComponent,
      ], // declare the test component
      providers: [],
      //  schemas: [ NO_ERRORS_SCHEMA ]
    })
      .compileComponents()
      .then(() => done());
  });

  beforeEach(() => {
    fixtureTextarea = TestBed.createComponent(TextareaTestHostComponent);
    compTextArea = fixtureTextarea.componentInstance;

    fixtureTextbox = TestBed.createComponent(TextboxTestHostComponent);
    compTextbox = fixtureTextbox.componentInstance;

    fixtureNumber = TestBed.createComponent(NumberTestHostComponent);
    compNumber = fixtureNumber.componentInstance;

    fixtureObject = TestBed.createComponent(ObjectTestHostComponent);
    compObject = fixtureObject.componentInstance;

    fixtureTextarea.detectChanges();
    fixtureTextbox.detectChanges();
    fixtureNumber.detectChanges();
    fixtureObject.detectChanges();
  });

  it('Should throw error in TextBox when entered an empty string and the field is required', (done) => {
    let changeEventIsDone = false;

    const resultObserver = compTextbox.fieldObserver;
    resultObserver.subscribe((result: any) => {
      if (result.message === 'validation') {
        fixtureTextbox.detectChanges();
        const textbox = fixtureTextbox.nativeElement.querySelector('.flogo-fields-base__error');
        if (textbox.innerText === 'FIELDS-BASE:TITLE-REQUIRED') {
          if (changeEventIsDone) {
            done();
          }
        }
      } else {
        if (result.message === 'change-field') {
          changeEventIsDone = true;
        }
      }
    });

    const textbox = fixtureTextbox.nativeElement.querySelector('input');
    textbox.value = '';
    const evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    textbox.dispatchEvent(evt);
  });

  it('Should throw error in Number field when entered an empty string and the field is required', (done) => {
    let changeEventIsDone = false;
    compNumber.fieldObserver.subscribe((result: any) => {
      if (result.message === 'validation') {
        fixtureNumber.detectChanges();
        const numberBox = fixtureNumber.nativeElement.querySelector('.flogo-fields-base__error');
        if (numberBox.innerText === 'FIELDS-BASE:TITLE-REQUIRED') {
          if (changeEventIsDone) {
            done();
          }
        }
      } else {
        if (result.message === 'change-field') {
          changeEventIsDone = true;
        }
      }
    });

    const numberBox = fixtureNumber.nativeElement.querySelector('input');
    numberBox.value = undefined;
    const evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    numberBox.dispatchEvent(evt);
  });

  it('Should throw error in Object field when entered an empty string and the field is required', (done) => {
    let changeEventIsDone = false;
    compObject.fieldObserver.subscribe((result: any) => {
      if (result.message === 'validation') {
        fixtureObject.detectChanges();
        const numberBox = fixtureObject.nativeElement.querySelector('.flogo-fields-base__error');
        if (numberBox.innerText === 'FIELDS-BASE:TITLE-REQUIRED') {
          if (changeEventIsDone) {
            done();
          }
        }
      } else {
        if (result.message === 'change-field') {
          changeEventIsDone = true;
        }
      }
    });
    const numberBox = fixtureObject.nativeElement.querySelector('textarea');
    numberBox.value = ''; // undefined;
    const evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    numberBox.dispatchEvent(evt);
  });

  it('Should throw error when the control is displayed for first time and it has an invalid JSON value', (done) => {
    fixtureTextarea.detectChanges();
    const textarea = fixtureTextarea.nativeElement.querySelector('textarea');
    expect(textarea.classList).toContain('error');
    done();
  });

  it('Should throw error when value of input field is not a valid JSON', (done) => {
    let validationEventIsDone = false;

    compTextArea.fieldObserver.subscribe((result: any) => {
      if (result.message === 'validation') {
        fixtureTextarea.detectChanges();
        const textarea = fixtureTextarea.nativeElement.querySelector('textarea');
        const classes = toArray(textarea.classList);
        if (classes.indexOf('error') > 0) {
          validationEventIsDone = true;
        }
      } else {
        if (result.message === 'change-field') {
          if (validationEventIsDone) {
            done();
          }
        }
      }
    });

    fixtureTextarea.detectChanges();
    const textarea = fixtureTextarea.nativeElement.querySelector('textarea');
    textarea.value = 'invalid JSON value';
    const evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    textarea.dispatchEvent(evt);
  });

  it('Should not throw error when user clear the value', (done) => {
    let validationEventIsDone = false;

    compTextArea.fieldObserver.subscribe((result: any) => {
      if (result.message === 'validation') {
        fixtureTextarea.detectChanges();
        const textarea = fixtureTextarea.nativeElement.querySelector('textarea');
        if (!textarea.classList['error']) {
          validationEventIsDone = true;
        }
      } else {
        if (result.message === 'change-field') {
          if (validationEventIsDone) {
            done();
          }
        }
      }
    });

    fixtureTextarea.detectChanges();
    const textarea = fixtureTextarea.nativeElement.querySelector('textarea');
    textarea.value = '';

    const evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    textarea.dispatchEvent(evt);
  });

  it('Should clear the error when user enters a valid JSON', (done) => {
    let validationEventIsDone = false;

    compTextArea.fieldObserver.subscribe((result: any) => {
      if (result.message === 'validation') {
        fixtureTextarea.detectChanges();
        const textarea = fixtureTextarea.nativeElement.querySelector('textarea');
        if (!textarea.classList['error']) {
          validationEventIsDone = true;
        }
      } else {
        if (result.message === 'change-field') {
          if (validationEventIsDone) {
            done();
          }
        }
      }
    });
    fixtureTextarea.detectChanges();
    const textarea = fixtureTextarea.nativeElement.querySelector('textarea');
    textarea.value = { 'color': 'blue' };

    const evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    textarea.dispatchEvent(evt);
  });

});

function toArray(obj) {
  const array = [];
  // todo: why bitwise operator is needed here?
  /* tslint:disable-next-line:no-bitwise */
  for (let i = obj.length >>> 0; i--; ) {
    array[i] = obj[i];
  }
  return array;
}
