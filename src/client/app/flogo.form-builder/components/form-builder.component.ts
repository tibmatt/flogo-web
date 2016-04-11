import { Component, SimpleChange } from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {PostService} from '../../../common/services/post.service';
import {BehaviorSubject, ReplaySubject} from 'rxjs/Rx';
import {PUB_EVENTS, SUB_EVENTS} from '../messages';
import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../../../common/constants';
import {FlogoFormBuilderFieldsRadio as FieldRadio} from '../../flogo.form-builder.fields/components/fields.radio/fields.radio.component';
import {FlogoFormBuilderFieldsTextBox as FieldTextBox} from '../../flogo.form-builder.fields/components/fields.textbox/fields.textbox.component';
import {FlogoFormBuilderFieldsTextArea as FieldTextArea} from '../../flogo.form-builder.fields/components/fields.textarea/fields.textarea.component';
import {FlogoFormBuilderFieldsNumber as FieldNumber} from '../../flogo.form-builder.fields/components/fields.number/fields.number.component';

@Component({
  selector: 'flogo-form-builder',
  moduleId: module.id,
  styleUrls: ['form-builder.css'],
  templateUrl: 'form-builder.tpl.html',
  directives: [ROUTER_DIRECTIVES, FieldRadio, FieldTextBox, FieldTextArea, FieldNumber ],
  inputs: ['_task:task','_step:step', '_context:context']
})
export class FlogoFormBuilderComponent{
  _observerInput:ReplaySubject;
  _observerOutput:ReplaySubject;
  _task: any;
  _step: any;
  _context: any;
  _subscriptions: any[];
  _canRunFromThisTile: boolean = false;
  _attributes:any;
  _hasChanges:boolean = false;
  _attributesOriginal:any;

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
    this._observerInput = new ReplaySubject(2);
    this._observerOutput = new ReplaySubject(2);

    this._observerInput.subscribe((changedObject:any) => {
      this._updateAttributeByUserChanges(this._attributes.inputs, changedObject);
      this._hasChanges = true;
    });

    this._observerInput.subscribe((changedObject:any) => {
      this._updateAttributeByUserChanges(this._attributes.outputs, changedObject);
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
    this._attributesOriginal = _.cloneDeep(this._task.attributes || {});
    this._setEnvironment(this._task.attributes || {});
  }

  _setEnvironment(attributes:any) {
    this._canRunFromThisTile =  (this._context.isTrigger || this._context.hasProcess);
    this._attributes = { inputs: attributes['inputs'] || [], outputs: attributes['outputs'] || [] };

    this._attributes.inputs.map((input) => {   input.mappings = this._task.inputMappings;    input.step  = this._step });
    this._attributes.outputs.map((output) => { output.mappings = this._task.outputMappings;  output.step =  this._step });
  }

  getControlByType(type:string) {
    switch(type) {
      case  FLOGO_TASK_ATTRIBUTE_TYPE.STRING:
        return {control: 'FieldTextBox'};

      case FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER:
        return {control:'FieldNumber'};

      case FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN:
        return {control:'FieldRadio'};

      case FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT:
        return {control:'FieldTextArea'};

      default:
        return {control:'TextBox'};
    }

  }

  getInfo(input:any) {
    var info = {
      name:       input.name,
      type:       input.type,
      title:      input.title || input.name || '',
      value:      input.value,
      mappings:   input.mappings,
      step:       input.step
    };
    info.value = this._getMappingValue(info);

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
    var inputs = this._getCurrentTaskState(this._attributes.inputs);

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

  cancelEdit(event) {
    this._setEnvironment(_.cloneDeep(this._attributesOriginal || {}));
    this._hasChanges = false

  }

}
