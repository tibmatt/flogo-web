import { Component } from '@angular/core';
import { FlogoFormBuilderFieldsBaseComponent } from '../fields.base/fields.base.component';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  selector: 'flogo-form-builder-fields-textbox',
  styleUrls: ['fields.textbox.less', '../fields.base/fields.base.less'],
  // moduleId: module.id,
  templateUrl: 'fields.textbox.tpl.html',
  // disabling no-input-rename rule to make the linter pass for now
  // decided to skip fixing because this class should be deprecated
  /* tslint:disable-next-line:use-input-property-decorator */
  inputs: ['_info:info', '_fieldObserver:fieldObserver']
})

export class FlogoFormBuilderFieldsTextBoxComponent extends FlogoFormBuilderFieldsBaseComponent {
  _info: any;
  _fieldObserver: any;


  constructor(public translate: TranslateService) {
    super(translate);
  }

}
