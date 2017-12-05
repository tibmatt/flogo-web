import { Component } from '@angular/core';
import { FlogoFormBuilderFieldsBaseComponent } from '../shared/base.component';
import { LanguageService } from '@flogo/core';

@Component({
  selector: 'flogo-flow-form-builder-fields-number',
  styleUrls: ['number.component.less', '../shared/base.component.less'],
  // moduleId: module.id,
  templateUrl: 'number.component.html',
  // disabling no-input-rename rule to make the linter pass for now
  // decided to skip fixing because this class should be deprecated
  /* tslint:disable-next-line:use-input-property-decorator */
  inputs: ['_info:info', '_fieldObserver:fieldObserver']
})

export class FlogoFormBuilderFieldsNumberComponent extends FlogoFormBuilderFieldsBaseComponent {
  _info: any;
  _fieldObserver: any;

  constructor(translate: LanguageService) {
    super(translate);
  }

}
