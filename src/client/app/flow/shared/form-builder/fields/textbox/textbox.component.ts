import { Component } from '@angular/core';
import { LanguageService } from '@flogo/core';
import { FlogoFormBuilderFieldsBaseComponent } from '../shared/base.component';

@Component({
  selector: 'flogo-flow-form-builder-fields-textbox',
  styleUrls: ['textbox.component.less', '../shared/base.component.less'],
  // moduleId: module.id,
  templateUrl: 'textbox.component.html',
  // disabling no-input-rename rule to make the linter pass for now
  // decided to skip fixing because this class should be deprecated
  /* tslint:disable-next-line:use-input-property-decorator */
  inputs: ['_info:info', '_fieldObserver:fieldObserver']
})

export class FlogoFormBuilderFieldsTextBoxComponent extends FlogoFormBuilderFieldsBaseComponent {
  _info: any;
  _fieldObserver: any;

  constructor(translate: LanguageService) {
    super(translate);
  }

}
