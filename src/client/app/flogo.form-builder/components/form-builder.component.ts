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
import {convertTaskID, parseMapping} from "../../../common/utils";
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
  _fieldObserver:ReplaySubject<any>;
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

    let subs :any[] = [];

    _.each(
      (subs:any, sub:any) => {
        this._subscriptions.push( this._postService.subscribe( sub ) );
      }
    );
  }

  ngOnDestroy() {

    if ( this._hasChanges ) {
      this._saveChangesToFlow();
    }

    _.each( this._subscriptions, (sub:any) => {
        this._postService.unsubscribe( sub );
      }
    );
  }

  _saveActivityChangesToFlow() {
    var warnings = this.verifyRequiredFields(this._task);

    var state = {
      taskId: this._task.id,
      inputs: this._getCurrentTaskState(this._attributes.inputs),
      warnings: warnings
    };

    this._postService.publish(_.assign({}, PUB_EVENTS.taskDetailsChanged, {
      data: state,
      done: ()=> {
        this._hasChanges  = false;
      }
    }));


  }

  // TODO
  _saveTriggerChangesToFlow() {

    let currentOutputs = this._attributesTrigger.outputs;

    let state = {
      taskId: this._task.id,
      outputs: currentOutputs
    };

    this._postService.publish(_.assign({}, PUB_EVENTS.taskDetailsChanged, {
      data: state,
      done: ()=> {
        this._hasChanges  = false;
      }
    }));

  }

  // TODO
  _saveBranchChangesToFlow() {
    console.warn('TODO save branch info');
    this._hasChanges  = false;
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

    // handle outputs changes of trigger
    this._fieldObserver.filter((param:any) => {
      return param.message == 'change-field' && param.payload.isTrigger && param.payload.direction === 'output';
    }).
    subscribe((param:any) => {
      this._updateAttributeByUserChanges(this._attributesTrigger.outputs, param.payload);
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

  private verifyRequiredFields( task : any ) {
    let warnings = [];

    //  verify if all of the required fields are fulfilled.
    _.some( _.get( this._task, 'attributes.inputs' ), ( input : any ) => {
      if ( input.required && ( (<any>_).isNil( input.value )
          || (_.isString( input.value ) && _.isEmpty( input.value ))
        ) ) {

        //  add configure required msg;
        warnings.push({ msg : 'Configure Required' });
        return true;
      }

      return false;
    } );

    return warnings;
  }

  _setTaskWarnings():void {
    var taskId   = this._task.id;
    var warnings = this.verifyRequiredFields(this._task);


     this._postService.publish(_.assign({},PUB_EVENTS.setTaskWarnings, {
      data: {warnings,  taskId},
      done: () => {}
      } ));



  }

  _setupEnvironment() {
    this._fieldsErrors = [];

    if(!this._context) {
      this._context = {isTrigger:false , isTask: false, isBranch:false,  hasProcess:false, _isDiagramEdited:false };
    }

    this._canRunFromThisTile =  this._getCanRunFromThisTile();


    if(this._context.isTrigger) {
      var attributesTrigger : any = {};
      var task = this._task || {};

      attributesTrigger['endpointSettings'] = ((task['endpoint'] || {})['settings']) || [];

      // override trigger outputs attributes if there is internal values
      attributesTrigger[ 'outputs' ] = _.get( task, '__props.initData', task[ 'outputs' ] || [] );
      attributesTrigger['settings'] = task['settings'] || [];

      this._attributesTriggerOriginal = _.cloneDeep(attributesTrigger);
      this._setTriggerEnvironment(attributesTrigger);
      return;
    }

    if(this._context.isTask) {
      var attributes = this._task ? this._task.attributes || {} : {};
      this._attributesOriginal = _.cloneDeep(attributes);
      this._setTaskEnvironment(attributes);

      setTimeout(()=> {
        this._setTaskWarnings();
      },1000);
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

    this._attributes.inputs.map((input:any) => {   input.mappings = this._task.inputMappings;    input.step  = this._step });
    this._attributes.outputs.map((output:any) => { output.mappings = this._task.outputMappings;  output.step =  this._step });
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

      case FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS:
        return {control:'FieldParams'};

      default:
        return {control:'TextBox'};
    }

  }

  _mapTypeToConstant(type:string|FLOGO_TASK_ATTRIBUTE_TYPE) {

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

      case FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS:
      case 'map':
      case 'params':
        return FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS;

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

  getTriggerInfo(input:any, direction?:string) {
    var info = {
      name:       input.name,
      type:       input.type,
      title:      input.title || input.name || '',
      value:      input.value,
      mappings:   input.mappings,
      step:       input.step,
      validation: input.validation,
      validationMessage: input.validationMessage,
      required:   input.required || false,
      placeholder: input.placeholder || '',
      isTrigger:  true,
      isBranch:   false,
      direction: direction
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
      required:   input.required || false,
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
    let resultValue : any = null;
    if(info.step) {
      let taskId = convertTaskID(this._task.id);
      if (info.direction === 'output') {
        resultValue = _.find(info.step.flow.attributes, (attr:any) => attr.name == `[A${taskId}.${info.name}]`)
      } else {
        // TODO support map to nested attributes
        let mapping = _.find(info.mappings, (mapping:any) => mapping.mapTo === info.name);
        let parsedMapping = mapping ? parseMapping(mapping.value) : null;
        if(parsedMapping) {
          let resultHolder = _.find(info.step.flow.attributes, (attr:any) => {
            return attr.name == parsedMapping.autoMap;
          });
          if(resultHolder) {
            if(parsedMapping.path) {
              resultValue = {
                value: _.get(resultHolder.value, parsedMapping.path)
              };
            } else {
              resultValue = resultHolder;
            }
          }
        }
      }
    }
    return resultValue ? resultValue.value : info.value;
  }

  runFromThisTile() {
    // return the id of the task directly, this id is encoded using `flogoIDEncode`, should be handled by subscribers
    var taskId   = this._task.id;
    var inputs = (this._context.isTrigger) ? {} : this._getCurrentTaskState(this._attributes.inputs);

    this._postService.publish(_.assign({},PUB_EVENTS.runFromThisTile, {
      data: {inputs, taskId},
      done: () => {
        this._hasChanges = false;
      }
    } ));

  }

  _getCurrentTaskState(items:any[]) {
       var result :any = {};

       items.forEach((item:any) => {
         result[item.name] = item.value || null;
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

  private _saveChangesToFlow() {
    if ( this._context.isTask ) {
      this._saveActivityChangesToFlow();
    } else if ( this._context.isTrigger ) {
      this._saveTriggerChangesToFlow();
    } else if ( this._context.isBranch ) {
      this._saveBranchChangesToFlow();
    }
  }

  saveChanges( event? : any ) {
    this._saveChangesToFlow();
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
