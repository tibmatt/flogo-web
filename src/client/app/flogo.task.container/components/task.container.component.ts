import {Component, Input, DynamicComponentLoader, ElementRef, Injectable } from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoTaskFieldStringComponent} from '../../flogo.task.field/components/field-string.component';
import {FlogoTaskFieldNumberComponent} from '../../flogo.task.field/components/field-number.component';
import {FlogoTaskFieldBooleanComponent} from '../../flogo.task.field/components/field-boolean.component';
import {FlogoTaskFieldObjectComponent} from '../../flogo.task.field/components/field-object.component';
import {Observable, BehaviorSubject} from 'rxjs/Rx';
import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../../../common/constants';

@Component({
  selector: 'flogo-task-container',
  styleUrls: ['task.container.css'],
  inputs:['inputSchemaSubject','inputStateSubject', 'modifiedStateSubject','data'],
  moduleId: module.id,
  templateUrl: 'task.container.tpl.html',
  directives: [ROUTER_DIRECTIVES]
})
export class FlogoTaskContainerComponent{
  task:any;
  data:any;
  inputSchemaSubject:any;
  inputStateSubject:any;
  modifiedStateSubject:any;
  componentsByType: any;
  fieldSubject:any;
  inputFields: Object[];
  hasErrors:boolean;

  constructor(public dcl: DynamicComponentLoader, public elementRef:ElementRef) {

    this.componentsByType =  {
      [FLOGO_TASK_ATTRIBUTE_TYPE.STRING]: FlogoTaskFieldStringComponent,
      [FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER]: FlogoTaskFieldNumberComponent,
      [FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT]: FlogoTaskFieldObjectComponent,
      [FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN]: FlogoTaskFieldBooleanComponent
    }

  }




  ngOnInit() {
    this.inputFields = [];
    this.hasErrors = false;

    this.inputFields.forEach((input:any) => {
      input.dispose();
    });

    this.inputFields = [];
    this.fieldSubject = new BehaviorSubject('');

    var inputs =  this.data.attributes.inputs || [];
    var outputs = this.data.attributes.outputs || [];

    this.addFieldSetToDOM(inputs, 'inputFields');
    this.addFieldSetToDOM(outputs, 'outputFields');
  }

  addFieldSetToDOM(fieldSet:any, location:string) {

    fieldSet.forEach((schema:any) => {
      let fieldSchema = this.getCurrentFieldSchema(schema);
      // base on the type load the correct control
      let component = this.componentsByType[fieldSchema.type];

      if(component) {
        this.loadIntoLocation(component, location)
          .then(ref => {
            ref.instance.setConfiguration(fieldSchema, this.fieldSubject);
            this.inputFields.push(ref);
          });
      }
      // TODO throw error because the component was not found
    });
  }

  loadIntoLocation(component:any, location:string) {
    return this.dcl.loadIntoLocation(component, this.elementRef, location);
  }

  getFieldState(schemaName:string, tasks:any) {
    return tasks.find((task:any) => {
      return task['name'] = schemaName;
    });
  }

  getModifiedStateTask() {
    var jsonInputs:any = {};
    var jsonOutputs:any = {};
    var modified:any = {};

    this.inputFields.forEach((input:any) => {
      let field:any = input.instance.exportToJson();
      let key = Object.keys(field)[0];
      let value = field[key];
      if(input.instance.getParameterType() === 'input') {
        jsonInputs[key] = value;
      } else {
        jsonOutputs[key] = value;
      }
    });

    if(this.task) {
      modified = {
        "name": this.task.schema.name,
        "title": this.task.schema.title,
        "description": this.task.schema.description,
        "inputs": jsonInputs,
        "outputs": jsonOutputs
      }
    }

    return modified;
  }

  getCurrentFieldSchema(schema: any) {

    return {
      name:              schema.name,
      title:             schema.title             || schema.name,
      type:              schema.type              || FLOGO_TASK_ATTRIBUTE_TYPE.STRING,
      description:       schema.description       || '',
      required:          schema.required          || false,
      validation:        schema.validation        || '',
      validationMessage: schema.validationMessage || '',
      value:             schema.value             || ''
    }

  }

}
