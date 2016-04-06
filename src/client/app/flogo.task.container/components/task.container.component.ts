import {Component, Input, DynamicComponentLoader, ElementRef, Injectable } from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoTaskFieldStringComponent} from '../../flogo.task.field/components/field-string.component';
import {FlogoTaskFieldNumberComponent} from '../../flogo.task.field/components/field-number.component';
import {FlogoTaskFieldBooleanComponent} from '../../flogo.task.field/components/field-boolean.component';
import {FlogoTaskFieldObjectComponent} from '../../flogo.task.field/components/field-object.component';
import {Observable, BehaviorSubject, ReplaySubject} from 'rxjs/Rx';
import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../../../common/constants';
import {PostService} from '../../../common/services/post.service';
import {PUB_EVENTS, SUB_EVENTS} from '../messages';

const INPUT_FIELDS = 'inputFields';
const OUTPUT_FIELDS = 'outputFields';

@Component({
  selector: 'flogo-task-container',
  styleUrls: ['task.container.css'],
  inputs:['inputSchemaSubject','inputStateSubject', 'modifiedStateSubject','data'],
  moduleId: module.id,
  templateUrl: 'task.container.tpl.html',
  directives: [ROUTER_DIRECTIVES]
})
export class FlogoTaskContainerComponent{
  hasChanges:boolean;
  task:any;
  data:any;
  _subscriptions: any[];
  inputSchemaSubject:any;
  inputStateSubject:any;
  modifiedStateSubject:any;
  componentsByType: any;
  fieldSubject:any;
  inputFields: Object[];
  hasErrors:boolean;
  canRunFromThisTile:boolean;
  initialFields:any;

  constructor(public dcl: DynamicComponentLoader, public elementRef:ElementRef, private _postService:PostService) {
    this.hasChanges = false;
    this.inputFields = [];

    this.componentsByType =  {
      [FLOGO_TASK_ATTRIBUTE_TYPE.STRING]: FlogoTaskFieldStringComponent,
      [FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER]: FlogoTaskFieldNumberComponent,
      [FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT]: FlogoTaskFieldObjectComponent,
      [FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN]: FlogoTaskFieldBooleanComponent
    };

    this._initSubscribe();
  }

  private _initSubscribe() {
    this._subscriptions = [];

    this._subscriptions = [
      _.assign( {}, SUB_EVENTS.updateTaskResults, { callback : this._updateTaskResults.bind( this ) } ),
    ];

    _.each(this._subscriptions, sub => {
        this._subscriptions.push( this._postService.subscribe( sub ) );
      }
    );
  }

  _updateTaskResults(data:any, envelope:any) {
    var outputs = _.cloneDeep(this.data.attributes.outputs) || [];

    this._mapResults(outputs, data.result, this.data.outputMappings);

    // update the value of the fields
    this.inputFields.forEach((input:any) => {
      outputs.forEach((field:any)=> {
        input.instance.updateValue(OUTPUT_FIELDS,field.name,field.value);
      });
    });

  }

  ngOnDestroy() {


    _.each( this._subscriptions, sub => {
        this._postService.unsubscribe( sub );
      }
    );
  }

  _mapResults(fieldSet:any[], stepResult:any, outputMappings:any[]) {

    if(stepResult && stepResult.process) {
      let attributes = stepResult.process.attributes || [];
      attributes.forEach((attribute:any)=> {
        // check if the attribute is
        let mapping = _.find(outputMappings, (mapping:any) => {
          return attribute.name === mapping.mapTo;
        });

        if(mapping) {
          let item = _.find(fieldSet, (output:any) => {
            return output.name === mapping.value;
          });
          if(item) {
            item.value = attribute.value;
          }
        }
      });
    }
  }

  getCanRunFromThisTile(step:any) {
    return (step.result || !step.result && step.number == 1);
  }

  updateAttributeByUserChanges(changedObject:any) {
    //var fields = (changedObject.parameterType === INPUT_FIELDS) ? this.data.attributes.inputs || [] : this.data.attributes.outputs || [];
    var fields = (changedObject.parameterType === INPUT_FIELDS) ? this.initialFields.inputs || [] : this.initialFields.outputs || [];

    var item = _.find(fields, (field:any) => {
      return field.name === changedObject.name;
    });

    if(item) {
      item.value = changedObject.value
    }

  }

  getCurrentAttributesValues() {
    var currentAttributesValues = sessionStorage.getItem('task-attributes-' + this.data.id);
    return (currentAttributesValues) ? JSON.parse(currentAttributesValues) : this.data.attributes;
  }

  ngOnInit() {
    this.hasErrors = false;

    // detect changes on the fields
    this.fieldSubject = new ReplaySubject(2);
    this.fieldSubject.subscribe((changedObject:any) => {
      this.updateAttributeByUserChanges(changedObject);
      this.hasChanges = true;
    });

    this.data.attributes = this.getCurrentAttributesValues();

    if(!this.data.attributes) {
      this.data.attributes ={};
    }

    if(!this.data.step) {
      this.data.step = {};
    }
    this.canRunFromThisTile = this.getCanRunFromThisTile(this.data.step);
    this.restartFields();
  }

  restartFields() {
    this.initialFields = this.initFields();

    this.addFieldSetToDOM(this.initialFields.inputs, INPUT_FIELDS);
    this.addFieldSetToDOM(this.initialFields.outputs, OUTPUT_FIELDS);
  }

  cancelEdit() {
    this.restartFields();
    this.hasChanges = false;
  }


  initFields() {
    this.inputFields.forEach((input:any) => {
      input.dispose();
    });

    this.inputFields = [];

    var inputs =  _.cloneDeep(this.data.attributes.inputs || []);
    var outputs = _.cloneDeep(this.data.attributes.outputs || []);

    this._mapResults(outputs, this.data.step.result, this.data.outputMappings);
    //TODO  inputs

    return { inputs, outputs };
  }

  addFieldSetToDOM(fieldSet:any, location:string) {

    fieldSet.forEach((schema:any) => {
      let fieldSchema = this.getCurrentFieldSchema(schema);
      // base on the type load the correct control
      let component = this.componentsByType[fieldSchema.type];

      if(component) {
        this.loadIntoLocation(component, location)
          .then(ref => {
            ref.instance.setConfiguration(fieldSchema, this.fieldSubject, location);
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
      if(input.instance.getParameterType() === INPUT_FIELDS) {
        jsonInputs[key] = value;
      } else {
        jsonOutputs[key] = value;
      }
    });

    if(this.data) {
      modified = {
        "name": this.data.name,
        "title": '', //this.data.title || data.name,
        "description": '', //this.task.schema.description,
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

  runFromThisTile() {
    var modified = this.getModifiedStateTask();
    var inputs = modified.inputs || {};
    if(!this.data.step) {
      this.data.step = {};
    }
    var taskId   = (this.data.step.result) ? this.data.step.result['taskId'] : 0;

    this._postService.publish(_.assign({},PUB_EVENTS.runFromThisTile, {
      data: {inputs, taskId},
      done: () => {
        // If there is changes on the inputs send the changes to keep it
        if(this.hasChanges) {
          sessionStorage.setItem('task-attributes-' + this.data.id, JSON.stringify(this.initialFields));
          this.data.attributes = this.getCurrentAttributesValues();
          this.hasChanges = false;
        }
      }
    } ));
  }

}
