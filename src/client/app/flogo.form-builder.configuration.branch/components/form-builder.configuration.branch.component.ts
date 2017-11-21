import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  selector: 'flogo-form-builder-branch-configuration',
  // moduleId: module.id,
  templateUrl: 'form-builder.configuration.branch.tpl.html',
})
export class FlogoFormBuilderConfigurationBranchComponent implements OnChanges {
  // disabling no-input-rename rule to make the linter pass for now
  // decided to skip fixing because this class should be deprecated
  /* tslint:disable:no-input-rename */
  @Input('fieldObserver')
  _fieldObserver: any;
  @Input('attributes')
  _attributes: any;
  /* tslint:enable:no-input-rename */
  fields: any;

  constructor(public translate: TranslateService) {
  }

  ngOnChanges(change: { [propName: string]: SimpleChange }) {
    this.fields = this._attributes;
  }

  getBranchInfo(branchInfo: any) {
    return {
      name: 'condition',
      id: branchInfo.id,
      title: this.translate.get('FORM-BUILDER-CONFIGURATION-BRANCH:IF')['value'],
      value: branchInfo.condition,
      required: true,
      placeholder: '',
      isBranch: true,
      isTrigger: false,
      isTask: false,
      isEditable: true
    };
  }


}
