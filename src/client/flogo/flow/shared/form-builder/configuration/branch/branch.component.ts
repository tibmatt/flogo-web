import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { LanguageService } from '@flogo/core';

@Component({
  selector: 'flogo-flow-configuration-branch',
  templateUrl: 'branch.component.html',
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

  constructor(private translate: LanguageService) {
  }

  ngOnChanges(change: { [propName: string]: SimpleChange }) {
    this.fields = this._attributes;
  }

  getBranchInfo(branchInfo: any) {
    return {
      name: 'condition',
      id: branchInfo.id,
      title: this.translate.instant('FORM-BUILDER-CONFIGURATION-BRANCH:IF'),
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
