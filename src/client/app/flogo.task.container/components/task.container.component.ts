import {Component, Input, DynamicComponentLoader, ElementRef, Injectable } from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoTaskFieldStringComponent} from '../../flogo.task.field/components/field-string.component';
import {FlogoTaskFieldNumberComponent} from '../../flogo.task.field/components/field-number.component';
import {FlogoTaskFieldBooleanComponent} from '../../flogo.task.field/components/field-boolean.component';
import {FlogoTaskFieldObjectComponent} from '../../flogo.task.field/components/field-object.component';
import {Observable, BehaviorSubject} from 'rxjs/Rx';

@Component({
  selector: 'flogo-task-container',
  styleUrls: ['task.container.css'],
  inputs:['inputSchemaSubject','inputStateSubject', 'modifiedStateSubject'],
  moduleId: module.id,
  templateUrl: 'task.container.tpl.html',
  directives: [ROUTER_DIRECTIVES]
})
export class FlogoTaskContainerComponent{
  task:any;
  inputSchemaSubject:any;
  inputStateSubject:any;
  modifiedStateSubject:any;
  componentsByType: any;
  fieldSubject:any;
  inputFields: Object[];
  hasErrors:boolean;

  constructor(public dcl: DynamicComponentLoader, public elementRef:ElementRef) {

    this.componentsByType =  {
      'string': FlogoTaskFieldStringComponent,
      'number': FlogoTaskFieldNumberComponent,
      'boolean': FlogoTaskFieldBooleanComponent,
      'object': FlogoTaskFieldObjectComponent
    }

  }




  ngOnInit() {
    this.inputFields = [];
    this.hasErrors = false;

    this.fieldSubject = new BehaviorSubject('');

    this.fieldSubject.subscribe((value:string) => {
      this.modifiedStateSubject.next(this.getModifiedStateTask());
    });

    var schemaAndStateSubject = Observable.combineLatest(this.inputSchemaSubject, this.inputStateSubject, (schema:string, state:string) => {
      var jsonSchema:any, jsonState:any;

      try {
        jsonSchema = JSON.parse(schema);
        jsonState = JSON.parse(state);
        this.hasErrors = false;
      }
      catch(exc) {
        this.hasErrors = true;
        jsonSchema = null;
        jsonState = null;
      }

      return {
          schema: jsonSchema || {},
          state:  jsonState  || {}
      }

    });

    schemaAndStateSubject.subscribe( (task) => {
      this.task = task;

      this.inputFields.forEach((input:any) => {
        input.dispose();
      });

      this.inputFields = [];
      debugger;

      var inputs = this.task.schema.inputs || [];
      var outputs = this.task.schema.outputs || [];

      this.addFieldSetToDOM(inputs, 'inputFields');
      this.addFieldSetToDOM(outputs, 'outputFields');
    });


  }

  addFieldSetToDOM(fieldSet:any, location:string) {

    fieldSet.forEach((schema:any) => {
      let fieldSchema = this.getCurrentFieldSchema(schema);
      // base on the type load the correct control
      let component = this.componentsByType[fieldSchema.type];

      if(component) {
        this.loadIntoLocation(component, location)
          .then(ref => {
            let parameterType = (location === 'inputFields') ? 'input' : 'output';
            ref.instance.setConfiguration(fieldSchema, this.task.state, parameterType, this.fieldSubject);
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
    var jsonInputs:any = [];
    var jsonOutputs:any = [];
    var modified:any = {};

    this.inputFields.forEach((input:any) => {
      var field:any = input.instance.exportToJson();
      if(input.instance.getParameterType() === 'input') {
        jsonInputs.push(field);
      } else {
        jsonOutputs.push(field);
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
      type:              schema.type,
      description:       schema.description       || '',
      required:          schema.required          || false,
      validation:        schema.validation        || '',
      validationMessage: schema.validationMessage || ''
    }

  }

}
