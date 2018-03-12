import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange } from '@angular/core';

import { LanguageService } from '@flogo/core';
import {FlogoConfigurationCommonService} from '../shared/configuration-common.service';

@Component({
  selector: 'flogo-flow-configuration-trigger',
  templateUrl: 'trigger.component.html',
  styleUrls: ['trigger.component.less']
})
export class FlogoFormBuilderConfigurationTriggerComponent implements OnChanges {

  // disabling no-input-rename rule to make the linter pass for now
  // decided to skip fixing because this class should be deprecated
  /* tslint:disable:no-input-rename */
  @Input('fieldObserver')
  _fieldObserver: any;
  @Input('attributes')
  _attributes: any;
  @Input('context')
  _context: any;
  /* tslint:enable:no-input-rename */
  fields: any;
  directions: any;
  needEditConfirmation = false;
  messageNumFlowsUsed: string;
  isEditable: boolean;
  @Output() triggerAction: EventEmitter<string>;

  constructor(private _commonService: FlogoConfigurationCommonService,
              private translate: LanguageService) {
    this.isEditable = false;
    this.directions = _commonService.getParameterDirections();
    this.triggerAction = new EventEmitter<string>();
  }

  updateMessageNumFlowsUsed(numFlows) {
    if (numFlows > 1) {
      this.needEditConfirmation = true;
      this.isEditable = false;
    } else {
      this.needEditConfirmation = false;
      this.clickEditForNFlows();
    }
    this.messageNumFlowsUsed = this.translate.instant('FORM-BUILDER-CONFIGURATION-TRIGGER:EDIT', { value: numFlows });
  }

  clickEditForNFlows(event?) {
    this.isEditable = true;
    this.triggerAction.emit('trigger-edit');
  }

  clickMakeCopy(event) {
    this.triggerAction.emit('trigger-copy');
  }


  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    let numFlows: number;

    if (changes['_context']) {
      try {
        if (this._context.currentTrigger) {
          numFlows = this._context.currentTrigger.handlers.length;
        }
      } catch (err) {
        numFlows = 1;
        console.log(err);
      }
      this.updateMessageNumFlowsUsed(numFlows);
    }
    this.fields = {
      endpointSettings: this._commonService.getStructureFromAttributes('endpointSettings', this._attributes),
      settings: this._commonService.getStructureFromAttributes('settings', this._attributes),
      outputs: this._commonService.getStructureFromAttributes('outputs', this._attributes)
    };
  }

  getControlByType(item: any, parameterDirection?: string): any {
    return this._commonService.getControlByType(item, parameterDirection);
  }

  // TODO define interface
  getTriggerInfo(input: any, direction: string, structure: string): any {

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
      isTask: false,
      isTrigger: true,
      isBranch: false,
      direction: direction || '',
      // subfield where this item is located
      structure: structure || '',
      allowed: input.allowed,
      isEditable: structure === 'settings' ? this.isEditable : true
    };

    return _.assign({}, info, this.getControlByType(input.type));
  }

}
