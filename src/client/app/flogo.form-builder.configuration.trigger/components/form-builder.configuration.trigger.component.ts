import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange } from '@angular/core';

import { TranslateService } from 'ng2-translate/ng2-translate';
import {FlogoFormBuilderService} from '../../flow/shared/form-builder/form-builder.service';

@Component({
  selector: 'flogo-form-builder-trigger-configuration',
  templateUrl: 'form-builder.configuration.trigger.tpl.html',
  styleUrls: ['form-builder.configuration.trigger.less']
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
  @Output() onTriggerAction: EventEmitter<string>;

  constructor(private _commonService: FlogoFormBuilderService,
              public translate: TranslateService) {
    this.isEditable = false;
    this.directions = _commonService.getParameterDirections();
    this.onTriggerAction = new EventEmitter<string>();
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
    this.onTriggerAction.emit('trigger-edit');
  }

  clickMakeCopy(event) {
    this.onTriggerAction.emit('trigger-copy');
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
