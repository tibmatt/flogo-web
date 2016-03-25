import {Component, Input, DynamicComponentLoader, ElementRef, Injectable} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoTaskFieldStringComponent} from '../../flogo.task.field/components/field-string.component';
import {FlogoTaskFieldNumberComponent} from '../../flogo.task.field/components/field-number.component';
import {FlogoTaskFieldBooleanComponent} from '../../flogo.task.field/components/field-boolean.component';
import {FlogoTaskFieldObjectComponent} from '../../flogo.task.field/components/field-object.component';

@Component({
  selector: 'flogo-task-container',
  styleUrls: ['task.container.css'],
  inputs:['task'],
  moduleId: module.id,
  templateUrl: 'task.container.tpl.html',
  directives: [ROUTER_DIRECTIVES]
})

export class FlogoTaskContainerComponent{
  task: any;
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
    var inputs = this.task.inputs || [];

    inputs.forEach((config:any) => {
      let currentConfig = this.getCurrentConfiguration(config);
      let component = this.componentsByType[currentConfig.type];

      if(component) {
        this.dcl.loadIntoLocation(component, this.elementRef, 'controls')
          .then(ref => {
            ref.instance.setConfiguration(currentConfig);
          });
      }
      // TODO throw error because the component wasnot found
    });

  }

  getCurrentConfiguration(config: any) {

    return {
      name:              config.name,
      title:             config.title             || config.name,
      type:              config.type,
      description:       config.description       || '',
      required:          config.required          || false,
      validation:        config.validation        || '',
      validationMessage: config.validationMessage || ''
    }

  }

}
