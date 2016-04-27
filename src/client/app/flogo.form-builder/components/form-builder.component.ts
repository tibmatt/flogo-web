import { Component, SimpleChange } from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {PostService} from '../../../common/services/post.service';
import {BehaviorSubject, ReplaySubject} from 'rxjs/Rx';
import {PUB_EVENTS, SUB_EVENTS} from '../messages';
import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../../../common/constants';
import {FlogoFormBuilderFieldsRadio as FieldRadio} from '../../flogo.form-builder.fields/components/fields.radio/fields.radio.component';
import {FlogoFormBuilderFieldsTextBox as FieldTextBox} from '../../flogo.form-builder.fields/components/fields.textbox/fields.textbox.component';
import {FlogoFormBuilderFieldsParams as FieldParams} from '../../flogo.form-builder.fields/components/fields.params/fields.params.component';
import {FlogoFormBuilderFieldsTextArea as FieldTextArea} from '../../flogo.form-builder.fields/components/fields.textarea/fields.textarea.component';
import {FlogoFormBuilderFieldsNumber as FieldNumber} from '../../flogo.form-builder.fields/components/fields.number/fields.number.component';
import {Contenteditable} from '../../../common/directives/contenteditable.directive';

@Component({
  selector: 'flogo-form-builder',
  moduleId: module.id,
  styleUrls: ['form-builder.css'],
  templateUrl: 'form-builder.tpl.html',
  directives: [ROUTER_DIRECTIVES, FieldRadio, FieldTextBox, FieldTextArea, FieldNumber, FieldParams, Contenteditable],
  inputs: ['_task:task','_step:step', '_context:context']
})
export class FlogoFormBuilderComponent{
  _fieldObserver:ReplaySubject;
  _task: any;
  _step: any;
  _context: any;
  _subscriptions: any[];
  _canRunFromThisTile: boolean = false;
  _attributes:any;
  _hasChanges:boolean = false;
  _attributesOriginal:any;
  _attributesTriggerOriginal:any;
  _fieldsErrors:string[];
  _attributesTrigger:any;

  constructor(private _postService: PostService) {
    this._initSubscribe();
    this._setFieldsObservers();
  }

  private _initSubscribe() {
    this._subscriptions = [];

    let subs = [];

    _.each(
      subs, sub => {
        this._subscriptions.push( this._postService.subscribe( sub ) );
      }
    );
  }

  ngOnDestroy() {
    _.each( this._subscriptions, sub => {
        this._postService.unsubscribe( sub );
      }
    );
  }

  _setFieldsObservers() {

    this._fieldObserver = new ReplaySubject(2);

    // handle error status
    this._fieldObserver.filter((param:any) => {
      return param.message == 'validation' && param.payload.status == 'error';
    }).
    subscribe((param:any) => {
      // add to the error array
      if(this._fieldsErrors.indexOf(param.payload.field) == -1) {
        this._fieldsErrors.push(param.payload.field)
      }
    });

    //handle ok validation status
    this._fieldObserver.filter((param:any) => {
      return param.message == 'validation' && param.payload.status == 'ok';
    }).
    subscribe((param:any) => {
      // remove from the error array
      var index  = this._fieldsErrors.indexOf(param.payload.field);
      if(index != -1) {
        this._fieldsErrors.splice(index, 1);
      }
    });

    // handle change field input fields
    this._fieldObserver.filter((param:any) => {
      return param.message == 'change-field' && param.payload.isTrigger == false  && param.payload.direction == 'input';
    }).
    subscribe((param:any) => {
        this._updateAttributeByUserChanges(this._attributes.inputs, param.payload);
    });


    // handle change field output fields
    this._fieldObserver.filter((param:any) => {
      return param.message == 'change-field' && param.payload.isTrigger == false  && param.payload.direction == 'output';
    }).
    subscribe((param:any) => {
      this._updateAttributeByUserChanges(this._attributes.outputs, param.payload);
    });

    // when some field changes
    this._fieldObserver.filter((param:any) => {
      return param.message == 'change-field';
    }).
    subscribe((param:any) => {
      this._hasChanges = true;
    });


  }

  _updateAttributeByUserChanges(attributes:any, changedObject:any) {
    var item = _.find(attributes, (field:any) => {
      return field.name === changedObject.name;
    });

    if(item) {
      item.value = changedObject.value
    }
  }

  ngOnChanges() {
    this._setupEnvironment();
  }

  _setupEnvironment() {
    this._fieldsErrors = [];

    if(!this._context) {
      this._context = {isTrigger:false , isTask: false, isBranch:false,  hasProcess:false, _isDiagramEdited:false };
    }

    this._canRunFromThisTile =  this._getCanRunFromThisTile();


    if(this._context.isTrigger) {
      var attributesTrigger = {};
      var task = this._task || {};

      attributesTrigger['endpointSettings'] = ((task['endpoint'] || {})['settings']) || [];
      attributesTrigger['outputs'] = task['outputs'] || [];
      attributesTrigger['settings'] = task['settings'] || [];

      this._attributesTriggerOriginal = _.cloneDeep(attributesTrigger);
      this._setTriggerEnvironment(attributesTrigger);
      return;
    }

    if(this._context.isTask) {
      var attributes = this._task ? this._task.attributes || {} : {};
      this._attributesOriginal = _.cloneDeep(attributes);
      this._setTaskEnvironment(attributes);
      return;
    }
  }

  _getCanRunFromThisTile() {
    if(this._context.isTrigger) {
      return true;
    }

    if(this._context.isDiagramEdited) {
       return false;
    }

    return this._context.hasProcess;
  }

  _setTriggerEnvironment(attributes:any) {
    this._attributesTrigger = attributes;

  }

  _setTaskEnvironment(attributes:any) {
    this._attributes = { inputs: attributes['inputs'] || [], outputs: attributes['outputs'] || [] };

    this._attributes.inputs.map((input) => {   input.mappings = this._task.inputMappings;    input.step  = this._step });
    this._attributes.outputs.map((output) => { output.mappings = this._task.outputMappings;  output.step =  this._step });
  }

  getControlByType(type:string) {

    switch(this._mapTypeToConstant(type)) {

      case  FLOGO_TASK_ATTRIBUTE_TYPE.STRING:
        return {control: 'FieldTextBox'};

      case FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER:
        return {control:'FieldNumber'};

      case FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN:
        return {control:'FieldRadio'};

      case FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT:
        return {control:'FieldTextArea'};

      case FLOGO_TASK_ATTRIBUTE_TYPE.PARAM:
        return {control:'FieldParams'};

      default:
        return {control:'TextBox'};
    }

  }

  _mapTypeToConstant(type:string) {

    switch(type) {
      case 'string':
      case FLOGO_TASK_ATTRIBUTE_TYPE.STRING:
        return FLOGO_TASK_ATTRIBUTE_TYPE.STRING;

      case 'number':
      case FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER:
        return FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER;

      case FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN:
      case 'boolean':
        return FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN;

      case FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT:
      case 'object':
        return FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT;

      case FLOGO_TASK_ATTRIBUTE_TYPE.PARAM:
      case 'map':
      case 'params':
        return FLOGO_TASK_ATTRIBUTE_TYPE.PARAM;

      default:
        return FLOGO_TASK_ATTRIBUTE_TYPE.STRING;
    }
  }

  getBranchInfo() {
    var info = {
      name:       this._task.id,
      title:      'If',
      value:      this._task.condition,
      required:   true,
      placeholder: ''
    };

    return info;
  }

  getTriggerInfo(input:any) {
    var info = {
      name:       input.name,
      type:       input.type,
      title:      input.title || input.name || '',
      value:      input.value,
      mappings:   input.mappings,
      step:       input.step,
      validation: input.validation,
      validationMessage: input.validationMessage,
      required:   input.required,
      placeholder: input.placeholder || '',
      isTrigger:  true,
      isBranch:   false
    };


    return _.assign({}, info, this.getControlByType(input.type));
  }


  getTaskInfo(input:any, direction:any) {
    var info = {
      name:       input.name,
      type:       input.type,
      title:      input.title || input.name || '',
      value:      input.value,
      mappings:   input.mappings,
      step:       input.step,
      validation: input.validation,
      validationMessage: input.validationMessage,
      required:   input.required,
      placeholder: input.placeholder || '',
      isTrigger:  false,
      isBranch:   false,
      direction: direction
    };

    if(!this._context.isTrigger) {
      info.value = this._getMappingValue(info);
    }

    return _.assign({}, info, this.getControlByType(input.type));
  }

  _getMappingValue(info:any) {
    // if there is results
    if(info.step) {

      var mapping = _.find(info.mappings, (mapping) => {
        return mapping.value === info.name;
      });

      if (mapping) {
        var resultValue = _.find(info.step.process.attributes, (attribute) => {
          return mapping.mapTo == attribute.name;
        });

        if (resultValue) {
          return resultValue.value;
        }
      }
    }
    return info.value;
  }

  runFromThisTile() {
    // return the id of the task directly, this id is encoded using `flogoIDEncode`, should be handled by subscribers
    var taskId   = this._task.id;
    var inputs = (this._context.isTrigger) ? {} : this._getCurrentTaskState(this._attributes.inputs);

    this._postService.publish(_.assign({},PUB_EVENTS.runFromThisTile, {
      data: {inputs, taskId},
      done: () => {
        this._hasChanges = false;
        /*
         // If there is changes on the inputs send the changes to keep it
         if(this.hasChanges) {
         sessionStorage.setItem('task-attributes-' + this.data.id, JSON.stringify(this.initialFields));
         this.data.attributes = this.getCurrentAttributesValues();
         this.hasChanges = false;
         }
         */
      }
    } ));

  }

  _getCurrentTaskState(items:any[]) {
       var result :any = {};

       items.forEach((item:any) => {
         result[item.name] = item.value || '';
        });

        return result;
  }

  cancelEdit(event:any) {
    if(this._context.isTrigger) {
      this._setTriggerEnvironment(_.cloneDeep(this._attributesTriggerOriginal));
    }

    if(this._context.isTask){
      this._setTaskEnvironment(_.cloneDeep(this._attributesOriginal || {}));
    }


    this._fieldsErrors = [];
    this._hasChanges = false

  }

  changeTaskDetail(tileName: any) {
    console.log(tileName);

    this._postService.publish(_.assign({},PUB_EVENTS.changeTileName,
      {
        data: {tileName, taskId:this._task.id}
      }
    ));

  }
}
