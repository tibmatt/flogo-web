import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { Component }    from '@angular/core';
import { By }              from '@angular/platform-browser';
import { Http } from '@angular/http';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { FlowsModule as FlogoFlowsModule } from '../../flogo.flows/flogo.flows.module';
import { CommonModule as FlogoCommonModule } from '../../../common/common.module';
import { CoreModule as FlogoCoreModule } from '../../../common/core.module';
import {  FlogoFormBuilderFieldsTextArea } from './fields.textarea/fields.textarea.component';
import {  FlogoFormBuilderFieldsTextBox } from './fields.textbox/fields.textbox.component';
import {  FlogoFormBuilderFieldsNumber } from './fields.number/fields.number.component';
import {  FlogoFormBuilderFieldsObject } from './fields.object/fields.object.component';

@Component({
  selector: 'container-texarea',
  template: `
            <flogo-form-builder-fields-textarea [info]="info" [fieldObserver]="fieldObserver"></flogo-form-builder-fields-textarea>
            `
})
class ContainerTextarea {
  info: any;
  fieldObserver:ReplaySubject<any>;

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
    }
  }
}

@Component({
  selector: 'container-textbox',
  template: `
            <flogo-form-builder-fields-textbox [info]="info" [fieldObserver]="fieldObserver"></flogo-form-builder-fields-textbox>
            `
})
class ContainerTextbox {
  info: any;
  fieldObserver:ReplaySubject<any>;

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
    }
  }
}



@Component({
  selector: 'container-object',
  template: `
            <flogo-form-builder-fields-object [info]="info" [fieldObserver]="fieldObserver"></flogo-form-builder-fields-object>
            `
})
class ContainerObject {
  info: any;
  fieldObserver:ReplaySubject<any>;

  constructor() {
    this.fieldObserver = new ReplaySubject(2);
    this.info = {
      control: 'FieldObject',
      required: true,
      direction: 'input',
      isBranch: false,
      isTask: false,
      isTrigger: true,
      value: {message: 'hello'}
    }
  }
}


@Component({
  selector: 'container-number',
  template: `
            <flogo-form-builder-fields-number [info]="info" [fieldObserver]="fieldObserver"></flogo-form-builder-fields-number>
            `
})
class ContainerNumber {
  info: any;
  fieldObserver:ReplaySubject<any>;

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
    }
  }
}

describe('Form-builder component', () => {
  let compTextArea: ContainerTextarea;
  let fixtureTextarea: ComponentFixture<ContainerTextarea>;

  let compTextbox: ContainerTextarea;
  let fixtureTextbox: ComponentFixture<ContainerTextbox>;

  let compNumber: ContainerNumber;
  let fixtureNumber: ComponentFixture<ContainerNumber>;


  let compObject: ContainerObject;
  let fixtureObject: ComponentFixture<ContainerObject>;

  function createComponent() {
    return TestBed.compileComponents();
  }

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL= 120000;
  });

  beforeEach(done => {
    TestBed.configureTestingModule({
      imports: [
        FlogoCoreModule,
        FlogoCommonModule,
        FlogoFlowsModule
      ],
      declarations: [
        FlogoFormBuilderFieldsTextArea,
        FlogoFormBuilderFieldsTextBox,
        FlogoFormBuilderFieldsNumber,
        FlogoFormBuilderFieldsObject,
        ContainerTextarea,
        ContainerNumber,
        ContainerObject,
        ContainerTextbox,
      ], // declare the test component
      providers: [
      ],
      //  schemas: [ NO_ERRORS_SCHEMA ]
    })
      .compileComponents()
      .then(() => done());
  });

  beforeEach(() => {
    fixtureTextarea = TestBed.createComponent(ContainerTextarea);
    compTextArea = fixtureTextarea.componentInstance;

    fixtureTextbox = TestBed.createComponent(ContainerTextbox);
    compTextbox = fixtureTextbox.componentInstance;

    fixtureNumber = TestBed.createComponent(ContainerNumber);
    compNumber = fixtureNumber.componentInstance;

    fixtureObject = TestBed.createComponent(ContainerObject);
    compObject = fixtureObject.componentInstance;

    fixtureTextarea.detectChanges();
    fixtureTextbox.detectChanges();
    fixtureNumber.detectChanges();
    fixtureObject.detectChanges();
  });

  it('Should throw error in TextBox when entered an empty string and the field is required', (done) => {
    let changeEventIsDone = false;

    let result = compTextbox.fieldObserver;
    result.subscribe((result: any) => {
      if(result.message === 'validation') {
        fixtureTextbox.detectChanges();
        let textbox = fixtureTextbox.nativeElement.querySelector('.flogo-fields-base__error');
        if(textbox.innerText === 'FIELDS-BASE:TITLE-REQUIRED') {
          if(changeEventIsDone) {
            done();
          }
        }
      } else {
        if(result.message === 'change-field') {
          changeEventIsDone = true;
        }
      }
    });

    let textbox = fixtureTextbox.nativeElement.querySelector('input');
    textbox.value = '';
    let evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    textbox.dispatchEvent(evt);
  } );

  it('Should throw error in Number field when entered an empty string and the field is required', (done) => {
    let changeEventIsDone = false;
    compNumber.fieldObserver.subscribe((result: any) => {
      if(result.message === 'validation') {
        fixtureNumber.detectChanges();
        let numberBox = fixtureNumber.nativeElement.querySelector('.flogo-fields-base__error');
        if(numberBox.innerText === 'FIELDS-BASE:TITLE-REQUIRED') {
          if(changeEventIsDone) {
            done();
          }
        }
      } else {
        if (result.message === 'change-field') {
          changeEventIsDone = true;
        }
      }
    });

    let numberBox = fixtureNumber.nativeElement.querySelector('input');
    numberBox.value = undefined;
    let evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    numberBox.dispatchEvent(evt);
  });

  it('Should throw error in Object field when entered an empty string and the field is required', (done) => {
    let changeEventIsDone = false;
    compObject.fieldObserver.subscribe((result: any) => {
      if(result.message === 'validation') {
        fixtureObject.detectChanges();
        let numberBox = fixtureObject.nativeElement.querySelector('.flogo-fields-base__error');
        if (numberBox.innerText == 'FIELDS-BASE:TITLE-REQUIRED') {
          if(changeEventIsDone) {
            done();
          }
        }
      } else {
        if(result.message == 'change-field') {
          changeEventIsDone = true;
        }
      }
    });
    let numberBox = fixtureObject.nativeElement.querySelector('textarea');
    numberBox.value = ''; //undefined;
    let evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    numberBox.dispatchEvent(evt);
  });

  it('Should throw error when the control is displayed for first time and it has an invalid JSON value', (done) => {
    fixtureTextarea.detectChanges();
    let textarea = fixtureTextarea.nativeElement.querySelector('textarea');
    expect(textarea.classList).toContain('error');
    done();
  });

  it('Should throw error when value of input field is not a valid JSON', (done) => {
    let validationEventIsDone = false;

    compTextArea.fieldObserver.subscribe((result: any) => {
      if(result.message === 'validation') {
        fixtureTextarea.detectChanges();
        let textarea = fixtureTextarea.nativeElement.querySelector('textarea');
        let classes = toArray(textarea.classList);
        if(classes.indexOf('error') > 0) {
          validationEventIsDone = true;
        }
      } else {
        if(result.message == 'change-field') {
          if(validationEventIsDone) {
            done();
          }
        }
      }
    });

    fixtureTextarea.detectChanges();
    let textarea = fixtureTextarea.nativeElement.querySelector('textarea');
    textarea.value = 'invalid JSON value';
    let evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    textarea.dispatchEvent(evt);
  });

  it('Should not throw error when user clear the value', (done) => {
    let validationEventIsDone = false;

    compTextArea.fieldObserver.subscribe((result: any) => {
      if(result.message === 'validation') {
        fixtureTextarea.detectChanges();
        let textarea = fixtureTextarea.nativeElement.querySelector('textarea');
        if(!textarea.classList['error']) {
          validationEventIsDone = true;
        }
      } else {
        if(result.message == 'change-field') {
          if(validationEventIsDone) {
            done();
          }
        }
      }
    });

    fixtureTextarea.detectChanges();
    let textarea = fixtureTextarea.nativeElement.querySelector('textarea');
    textarea.value = '';

    let evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    textarea.dispatchEvent(evt);
  });

  it('Should clear the error when user enters a valid JSON', (done) => {
    let validationEventIsDone = false;

    compTextArea.fieldObserver.subscribe((result: any) => {
      if(result.message === 'validation') {
        fixtureTextarea.detectChanges();
        let textarea = fixtureTextarea.nativeElement.querySelector('textarea');
        if(!textarea.classList['error']) {
          validationEventIsDone = true;
        }
      } else {
        if(result.message == 'change-field') {
          if(validationEventIsDone) {
            done();
          }
        }
      }
    });
    fixtureTextarea.detectChanges();
    let textarea = fixtureTextarea.nativeElement.querySelector('textarea');
    textarea.value = {"color": "blue"};

    let evt = document.createEvent('Event');
    evt.initEvent('keyup', true, false);
    textarea.dispatchEvent(evt);
  });

});

function toArray(obj) {
  var array = [];
  for (var i = obj.length >>> 0; i--;) {
    array[i] = obj[i];
  }
  return array;
}
