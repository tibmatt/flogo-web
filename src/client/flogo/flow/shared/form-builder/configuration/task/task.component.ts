import { Component, Input, OnChanges, SimpleChange } from '@angular/core';

import { convertTaskID, parseMapping } from '@flogo/shared/utils';
import {FlogoConfigurationCommonService} from '../shared/configuration-common.service';

@Component({
  selector: 'flogo-flow-configuration-task',
  templateUrl: 'task.component.html'
})
export class FlogoFormBuilderConfigurationTaskComponent implements OnChanges {
  // disabling no-input-rename rule to make the linter pass for now
  // decided to skip fixing because this class should be deprecated
  /* tslint:disable:no-input-rename */
  @Input('fieldObserver')
  _fieldObserver: any;
  @Input('attributes')
  _attributes: any;
  @Input('task')
  _task: any;
  /* tslint:enable:no-input-rename */
  fields: any;
  directions: any;

  constructor(public _commonService: FlogoConfigurationCommonService) {
    this.fields = { inputs: [], outputs: [] };
    this.directions = _commonService.getParameterDirections();
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    this.refreshInputs();
  }

  refreshInputs() {
    this.fields = {
      inputs: this._commonService.getStructureFromAttributes('inputs', this._attributes),
      outputs: this._commonService.getStructureFromAttributes('outputs', this._attributes),
    };
  }

  getControlByType(item: any, parameterDirection?: string): any {
    return this._commonService.getControlByType(item, parameterDirection);
  }

  _getMappingValue(info: any) {
    if (!info.step) {
      return info.value;
    }

    let resultValue: any = null;
    const taskId = convertTaskID(this._task.id);
    if (info.direction === 'output') {
      resultValue = _.find(info.step.flow.attributes, (attr: any) => attr.name === `_A.${taskId}.${info.name}`);
    } else {
      // TODO support map to nested attributes
      const mapping = _.find(info.mappings, (m: any) => m.mapTo === info.name);
      const parsedMapping = mapping ? parseMapping(mapping.value) : null;
      if (parsedMapping) {
        const resultHolder = _.find(info.step.flow.attributes, (attr: any) => {
          return attr.name === parsedMapping.autoMap;
        });
        if (resultHolder) {
          if (parsedMapping.path) {
            resultValue = {
              value: _.get(resultHolder.value, parsedMapping.path)
            };
          } else {
            resultValue = resultHolder;
          }
        }
      }
    }
    return resultValue ? resultValue.value : info.value;
  }

  // TODO define interface
  getTaskInfo(input: any, direction: string, structure: string) {
    const info = {
      name: input.name,
      type: input.type,
      title: input.title || input.name || '',
      value: input.value,
      mappings: input.mappings,
      step: input.step,
      validation: input.validation,
      validationMessage: input.validationMessage,
      required: input.required || false,
      placeholder: input.placeholder || '',
      isTrigger: false,
      isBranch: false,
      isTask: true,
      direction: direction,
      // subfield where this item is located
      structure: structure,
      allowed: input.allowed,
      isEditable: true
    };

    info.value = this._getMappingValue(info);
    return _.assign({}, info, this.getControlByType(input));
  }


}
