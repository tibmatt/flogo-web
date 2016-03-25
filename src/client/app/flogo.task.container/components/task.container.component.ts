import {Component, Input, DynamicComponentLoader, ElementRef, Injectable} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoTaskFieldStringComponent} from '../../flogo.task.field/components/field-string.component';
import {FlogoTaskFieldNumberComponent} from '../../flogo.task.field/components/field-number.component';
import {FlogoTaskFieldBooleanComponent} from '../../flogo.task.field/components/field-boolean.component';
import {FlogoTaskFieldObjectComponent} from '../../flogo.task.field/components/field-object.component';

@Component({
  selector: 'flogo-task-container',
  styleUrls: ['task.container.css'],
  inputs:['schema','stateData'],
  moduleId: module.id,
  templateUrl: 'task.container.tpl.html',
  directives: [ROUTER_DIRECTIVES]
})

export class FlogoTaskContainerComponent{
  schema: any;
  stateData: any;
  stateTask: any;
  componentsByType: any;

  constructor(public dcl: DynamicComponentLoader, public elementRef:ElementRef) {

    this.componentsByType =  {
      'string': FlogoTaskFieldStringComponent,
      'number': FlogoTaskFieldNumberComponent,
      'boolean': FlogoTaskFieldBooleanComponent,
      'object': FlogoTaskFieldObjectComponent
    }

  }

  ngOnInit() {
    var inputs = this.schema.inputs || [];
    var outputs = this.schema.outputs || [];
    this.stateTask = this.getStateTask(this.schema.name, this.stateData.tasks || []) || [];

    this.addFieldSetToDOM(inputs, 'inputFields');
    this.addFieldSetToDOM(outputs, 'outputFields');
  }

  addFieldSetToDOM(fieldSet:any, location:string) {
    fieldSet.forEach((schema:any) => {
      let fieldSchema = this.getCurrentFieldSchema(schema);
      // base on the type load the correct control
      let component = this.componentsByType[fieldSchema.type];

      if(component) {
        this.dcl.loadIntoLocation(component, this.elementRef, location)
          .then(ref => {
            let parameterType = (location === 'inputFields') ? 'input' : 'output';
            ref.instance.setConfiguration(fieldSchema, this.stateTask, parameterType);
          });
      }
      // TODO throw error because the component wasnot found
    });
  }

  getStateTask(schemaName:string, tasks:any) {
    return tasks.find((task:any) => {
      return task['name'] = schemaName;
    });
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
