import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { PostService } from '../../../common/services/post.service';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { PUB_EVENTS, SUB_EVENTS } from '../messages';
import { FLOGO_ERROR_ROOT_NAME, FLOGO_PROFILE_TYPE, FLOGO_TASK_TYPE } from '../../../common/constants';
import { convertTaskID, getDefaultValue, normalizeTaskName } from '../../../common/utils';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'flogo-form-builder',
  // moduleId: module.id,
  styleUrls: ['form-builder.less'],
  templateUrl: 'form-builder.tpl.html'
})
/**
 * @deprecated
 */
export class FlogoFormBuilderComponent implements OnDestroy, OnChanges {
  _fieldObserver: ReplaySubject<any>;

  // disabling no-input-rename rule to make the linter pass for now
  // decided to skip fixing because this class should be deprecated anyway
  /* tslint:disable:no-input-rename */
  @Input('task')
  _task: any;
  @Input('step')
  _step: any;
  @Input('context')
  _context: any;
  @Input('flowId')
  _flowId: string;
  /* tslint:enable:no-input-rename */

  _subscriptions: any[];
  _canRunFromThisTile = false;
  _attributes: any;
  _hasChanges = false;
  _attributesOriginal: any;
  _fieldsErrors: string[];
  _branchConfigs: any[]; // force the fields update by taking the advantage of ngFor
  hasErrors = false;
  @Output() onBuilderAction: EventEmitter<string>;
  PROFILE_TYPES: typeof FLOGO_PROFILE_TYPE = FLOGO_PROFILE_TYPE;

  constructor(public route: ActivatedRoute, private _postService: PostService, private _translate: TranslateService) {
    this._initSubscribe();
    this._setFieldsObservers();

    this.onBuilderAction = new EventEmitter<string>();

    // same as onDestroy since router is reusing the components instead of destroying them
    // see: https://github.com/angular/angular/issues/7757#issuecomment-236737846
    this.route.params.subscribe(
      params => {
        if (this._hasChanges) {
          this._saveChangesToFlow(null);
        }
        this._hasChanges = false;
      }
    );

  }

  private _initSubscribe() {
    this._subscriptions = [];
    const subs = [
      _.assign({}, SUB_EVENTS.updatePropertiesToFormBuilder, { callback: this._updatePropertiesToFormBuilder.bind(this) })
    ];

    _.each(subs, (sub: any) => {
        this._subscriptions.push(this._postService.subscribe(sub));
      }
    );
  }

  public onAction(event) {
    this.onBuilderAction.emit(event);
  }

  ngOnDestroy() {
    if (this._hasChanges) {
      this._saveChangesToFlow(null);
    }

    _.each(this._subscriptions, (sub: any) => {
        this._postService.unsubscribe(sub);
      }
    );
  }

  _saveActivityChangesToFlow(changedStructure: string) {
    return new Promise((resolve, reject) => {
      const state = {
        taskId: this._task.id,
        warnings: []
      };

      if (this._context.isTask) {
        state['inputs'] = this._getCurrentTaskState(this._attributes.inputs);
        state['warnings'] = this.verifyRequiredFields(this._task);
        this._postService.publish(_.assign({}, PUB_EVENTS.taskDetailsChanged, {
          data: _.assign({}, { id: this._flowId }, state, { changedStructure: changedStructure }),
          done: () => {
            this._hasChanges = false;
            resolve();
          }
        }));
      }

      if (this._context.isTrigger) {
        state['endpointSettings'] = this._getCurrentTaskState(this._attributes.endpointSettings || []);
        state['outputs'] = this._getCurrentTaskState(this._attributes.outputs || []);
        state['settings'] = this._getCurrentTaskState(this._attributes.settings || []);
        this._postService.publish(_.assign({}, PUB_EVENTS.triggerDetailsChanged, {
          data: _.assign({}, { id: this._flowId }, state, { changedStructure: changedStructure }),
          done: () => {
            this._hasChanges = false;
            resolve();
          }
        }));
      }
    });
  }

  _saveBranchChangesToFlow() {
    return new Promise((resolve, reject) => {
      const diagramId = this._flowId;

      const self = this;
      const branchInfo = this._branchConfigs[0];
      const state = {
        taskId: branchInfo.id,
        id: diagramId,
        condition: self.convertBranchConditionToInternal(branchInfo.condition,
          _.get(self, '_context.contextData.previousTiles', []))
      };

      this._postService.publish(_.assign({}, PUB_EVENTS.taskDetailsChanged, {
        data: state,
        done: () => {
          this._hasChanges = false;
          resolve();
        }
      }));
    });
  }


  _setFieldsObservers() {
    this._fieldObserver = new ReplaySubject(2);
    // handle error status
    this._fieldObserver.filter((param: any) => {
      return param.message === 'validation' && param.payload.status === 'error';
    }).subscribe((param: any) => {
      // add to the error array
      if (this._fieldsErrors.indexOf(param.payload.field) === -1) {
        this._fieldsErrors.push(param.payload.field);
      }
    });

    // handle ok validation status
    this._fieldObserver.filter((param: any) => {
      return param.message === 'validation' && param.payload.status === 'ok';
    }).subscribe((param: any) => {
      // remove from the error array
      const index = this._fieldsErrors.indexOf(param.payload.field);
      if (index !== -1) {
        this._fieldsErrors.splice(index, 1);
      }
    });

    // when some field changes
    this._fieldObserver.filter((param: any) => {
      return param.message === 'change-field';
    }).subscribe((param: any) => {
      this._hasChanges = true;

      if (param.payload.isTask || param.payload.isTrigger) {
        this._updateAttributeByUserChanges(_.get(this._attributes, param.payload.structure, []), param.payload);
        this.saveChanges(param.payload.structure);

      }
    });

    // handle the change of condition of branch
    this._fieldObserver.filter((param: any) => {
      return param.message === 'change-field' && param.payload.isBranch && param.payload.name === 'condition';
    })
      .subscribe((param: any) => {
        this._branchConfigs[0].condition = param.payload.value;
        this.saveChanges(null);
      });
  }

  _updateAttributeByUserChanges(attributes: any, changedObject: any) {
    const item = _.find(attributes, (field: any) => {
      return field.name === changedObject.name;
    });

    if (item) {
      item.value = _.isEmpty(changedObject.value) ? null : changedObject.value;
    }

  }

  ngOnChanges(changes: any) {
    this._setupEnvironment();
  }

  private verifyRequiredFields(task: any) {
    const warnings = [];
    let inputs = [];

    if (task.type === FLOGO_TASK_TYPE.TASK_ROOT) {
      inputs = _.get(this._task, 'settings', []);
      inputs = inputs.concat(_.get(this._task, 'endpoint.settings', []));
    } else {
      if (task.type === FLOGO_TASK_TYPE.TASK) {
        inputs = _.get(this._task, 'attributes.inputs', []);
      }
    }

    //  verify if all of the required fields are fulfilled.
    _.some(inputs, (input: any) => {
      if (input.required && ( (<any>_).isNil(input.value)
          || (_.isString(input.value) && _.isEmpty(input.value))
        )) {

        //  add configure required msg;
        warnings.push({ msg: this._translate.instant('FORM-BUILDER:CONFIGURE-REQUIRED') });
        return true;
      }

      return false;
    });

    return warnings;
  }

  _setTaskWarnings(): void {
    const taskId = this._task.id;
    const warnings = this.verifyRequiredFields(this._task);

    this._postService.publish(_.assign({}, PUB_EVENTS.setTaskWarnings, {
      data: { warnings, taskId, id: this._flowId },
      done: () => {
      }
    }));
  }

  _setupEnvironment() {
    this._fieldsErrors = [];

    if (!this._context) {
      this._context = { isTrigger: false, isTask: false, isBranch: false, hasProcess: false, _isDiagramEdited: false };
    }

    this._canRunFromThisTile = this._getCanRunFromThisTile();

    const refresTaskWarnings = () => {

      setTimeout(() => {
        this._setTaskWarnings();
      }, 1000);

    };


    if (this._context.isTrigger) {
      const attributes: any = {};
      const task = this._task || {};

      // ((task['endpoint'] || {})['settings']) || [];
      attributes['endpointSettings'] = this._getArray(_.get(task, 'endpoint.settings', []));
      // override trigger outputs attributes if there is internal values
      // attributesTrigger[ 'outputs' ] = _.get( task, '__props.initData', task[ 'outputs' ] || [] );
      attributes['outputs'] = this._getArray(_.get(task, 'outputs', []));
      attributes['settings'] = this._getArray(task['settings'] || []);

      this._attributesOriginal = _.cloneDeep(attributes);
      this._setTriggerEnvironment(attributes);
      refresTaskWarnings();
      return;
    }

    if (this._context.isTask) {
      const attributes = this._task ? this._task.attributes || {} : {};
      this._attributesOriginal = _.cloneDeep(attributes);
      this._setTaskEnvironment(attributes);

      refresTaskWarnings();
      return;
    }

    if (this._context.isBranch) {
      this._setBranchEnvironment(this._task);
    }
  }

  _getCanRunFromThisTile() {
    if (this._flowId === 'errorHandler') {
      return false;
    }

    if (this._context.isTrigger) {
      return true;
    }

    if (this._context.isDiagramEdited) {
      return false;
    }

    return this._context.hasProcess;
  }

  _setTriggerEnvironment(attributes: any) {
    this._attributes = attributes;
  }

  _setTaskEnvironment(attributes: any) {
    this._attributes = { inputs: attributes['inputs'] || [], outputs: attributes['outputs'] || [] };

    this._attributes.inputs.map((input: any) => {
      input.mappings = this._task.inputMappings;
      input.step = this._step;
    });
    this._attributes.outputs.map((output: any) => {
      output.mappings = this._task.outputMappings;
      output.step = this._step;
    });
  }

  _setBranchEnvironment(branchInfo: any) {
    const self = this;
    this._branchConfigs = [
      _.assign({},
        {
          id: branchInfo.id,
          condition: self.convertBranchConditionToDisplay(branchInfo.condition,
            _.get(self, '_context.contextData.previousTiles', []))
        })
    ];
  }

  _getArray(obj: any) {

    if (!Array.isArray(obj)) {
      return [];
    }

    return obj;
  }

  runFromThisTile() {
    // return the id of the task directly, this id is encoded using `flogoIDEncode`, should be handled by subscribers
    const taskId = this._task.id;
    const inputs = (this._context.isTrigger) ? {} : this._getCurrentTaskState(this._attributes.inputs);

    this._postService.publish(_.assign({}, PUB_EVENTS.runFromThisTile, {
      data: { inputs, taskId, id: this._flowId },
      done: () => {
        this._hasChanges = false;
      }
    }));

  }

  runFromTrigger() {
    const taskId = this._task.id;
    const inputs = (this._context.isTrigger) ? {} : this._getCurrentTaskState(this._attributes.inputs);
    this._postService.publish(_.assign({}, PUB_EVENTS.runFromTrigger, {
      data: { inputs, taskId, id: this._flowId }
    }));
  }

  _getCurrentTaskState(items: any[]) {
    const result: any = {};

    items = this._getArray(items);

    items.forEach((item: any) => {
      result[item.name] = _.get(item, 'value', getDefaultValue(item.type));
    });

    return result;
  }

  cancelEdit(event: any) {
    if (this._context.isTrigger) {
      this._setTriggerEnvironment(_.cloneDeep(this._attributesOriginal));
    }

    if (this._context.isTask) {
      this._setTaskEnvironment(_.cloneDeep(this._attributesOriginal || {}));
    }

    if (this._context.isBranch) {
      this._setBranchEnvironment(this._task || {});
    }

    this._fieldsErrors = [];
    this._hasChanges = false;

  }

  private _saveChangesToFlow(changedStructure) {
    if (this._context.isTask || this._context.isTrigger) {
      return this._saveActivityChangesToFlow(changedStructure);
    } else if (this._context.isBranch) {
      return this._saveBranchChangesToFlow();
    }
    return null;
  }

  saveChanges(changedStructure) {
    console.log('Saving changes');
    return this._saveChangesToFlow(changedStructure);
  }

  changeTaskDetail(content: any, proper: string) {
    console.log(content);

    this._postService.publish(_.assign({}, PUB_EVENTS.changeTileDetail,
      {
        data: {
          content: content,
          proper: proper,
          taskId: this._task.id,
          id: this._flowId,
          tileType: this._context.isTrigger ? 'trigger' : 'activity'
        }
      }
    ));

  }

  convertBranchConditionToDisplay(condition: string, tiles: any[]): string {
    // display format sample: query-a-pet.result.code == 1
    // internal format sample: ${A<taskID>.result}.code == 1;

    // ensure condition is in string format
    condition = '' + condition;

    // cases
    //  ${T}
    //  ${A3}
    //  ${T.pathParams}
    //  ${A3.result}
    //  ${T.pathParams}.petId
    //  ${A3.result}.code
    //  ${E}
    //  ${E.message}
    //  ${E.data}.name
    const reComTriggerLabel = '(T)'; // T
    const reComActivityLabel = '(A)(\\d+)'; // A3
    const reComErrorLabel = '(E)'; // E
    const reComTaskLabel = `(${reComTriggerLabel}|${reComActivityLabel}|${reComErrorLabel})`; // T | A3 | E
    const reComPropNameWithoutQuote = '(?:\\$|\\w)+'; // sample: $propName1, _propName1

    const reProp = `(?:\\$\\{${reComTaskLabel}(\\.${reComPropNameWithoutQuote})?\\})((?:\\.${reComPropNameWithoutQuote})*)`;

    const pattern = new RegExp(reProp.replace(/\s/g, ''), 'g');

    const taskIDNameMappings = <any>{};

    _.each(tiles, (tile: any) => {
      if (tile.triggerType) {
        const key = tile.triggerType === FLOGO_ERROR_ROOT_NAME ? 'E' : 'T';
        taskIDNameMappings[key] = {
          name: normalizeTaskName(tile.name),
          triggerType: tile.triggerType,
          activityType: tile.activityType
        };
      } else {
        taskIDNameMappings['A' + convertTaskID(tile.id)] = {
          name: normalizeTaskName(tile.name),
          triggerType: tile.triggerType,
          activityType: tile.activityType
        };
      }
    });

    condition = condition.replace(pattern,
      (match: string,
       taskLabel: string,
       triggerTypeLabel: string,
       activityTypeLabel: string,
       errorTypeLabel: string,
       taskID: string,
       taskLabelProp: string,
       propPath: string,
       offset: number,
       wholeString: string) => {

        const taskInfo = taskIDNameMappings[taskLabel];

        if (taskInfo) {

          // delete first dot in the strings for right parsing
          taskLabelProp = taskLabelProp && taskLabelProp[0] === '.' ? taskLabelProp.substring(1) : taskLabelProp;
          propPath = propPath && propPath[0] === '.' ? propPath.substring(1) : propPath;

          const labelProp = _['toPath'](taskLabelProp).join('.');
          const props = _['toPath'](propPath).join('.'); // normalise prop paths

          if (labelProp) {
            return props ? `${taskInfo.name}.${labelProp}.${props}` : `${taskInfo.name}.${labelProp}`;
          } else {
            return `${taskInfo.name}`;
          }

        } else {
          return match;
        }
      });

    return condition;
  }

  convertBranchConditionToInternal(condition: string, tiles: any[]): string {
    // display format sample: query-a-pet.result.code == 1
    // internal format sample: $[A<taskID>.result].code == 1;

    // ensure condition is in string format
    condition = '' + condition;
    // paths cases
    //  base cases
    //    variable['propName']
    //    variable.propName
    //    variable["prop-name"]
    //  composition cases
    //    variable['propName']["prop-name"]
    //    variable['propName'].propName
    //    variable['propName'].propName["prop-name"]
    //    variable.propName.propName["prop-name"]
    const reComTaskName = '\\w+(?:\\-|\\w)*'; // sample: query-a-pet
    const reComPropNameWithoutQuote = '(?:\\$|\\w)+'; // sample: $propName1, _propName1
    const reComPropNameWithQuote = '(?:[\\$\\-]|\\w)+'; // '(?:\"|\')(?:[\\$\\-]|\\w)+(?:\"|\')'

    const reProp = `(${reComTaskName})
    ((?:
      (?:\\.${reComPropNameWithoutQuote}) |
      (?:\\[
        (?:
          (?:\\"${reComPropNameWithQuote}\\") |
          (?:\\'${reComPropNameWithQuote}\\')
        )\\]
      )
    )+)`;

    const pattern = new RegExp(reProp.replace(/\s/g, ''), 'g');

    const taskNameIDMappings = <any>{};

    _.each(tiles, (tile: any) => {
      taskNameIDMappings[normalizeTaskName(tile.name)] = {
        id: convertTaskID(tile.id),
        triggerType: tile.triggerType,
        activityType: tile.activityType
      };
    });

    condition = condition.replace(pattern,
      (match: string, taskName: string, propPath: string, offset: number, wholeString: string) => {

        const taskInfo = taskNameIDMappings[normalizeTaskName(taskName)];
        if (taskInfo) {
          let mappableTaskName;
          if (taskInfo.triggerType) {
            mappableTaskName = taskInfo.triggerType === FLOGO_ERROR_ROOT_NAME ? 'E' : 'T';
          } else {
            mappableTaskName = `A${taskInfo.id}`;
          }

          // delete first dot in the string for right parsing
          propPath = propPath && propPath[0] === '.' ? propPath.substring(1) : propPath;

          const _propPath = _['toPath'](propPath);
          const firstProp = _propPath.shift();

          if (firstProp) {
            return _propPath.length ?
              `$\{${mappableTaskName}.${firstProp}\}.${_propPath.join('.')}` :
              `$\{${mappableTaskName}.${firstProp}\}`;
          } else {
            return `$\{${mappableTaskName}\}`;
          }
        } else {
          return match;
        }
      });
    return condition;
  }

  _updatePropertiesToFormBuilder(data: any, envelope: any) {
    this._task.name = data.name;
  }
}
