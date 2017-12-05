import { Component } from '@angular/core';
import { LanguageService } from '@flogo/core';
import { FlogoFormBuilderFieldsBaseComponent } from '../shared/base.component';

@Component({
  selector: 'flogo-flow-form-builder-fields-radio',
  styleUrls: ['radio.component.less', '../shared/base.component.less'],
  // moduleId: module.id,
  templateUrl: 'radio.component.html',
  // disabling no-input-rename rule to make the linter pass for now
  // decided to skip fixing because this class should be deprecated
  /* tslint:disable-next-line:use-input-property-decorator */
  inputs: ['_info:info', '_fieldObserver:fieldObserver', '_index:index']
})

export class FlogoFormBuilderFieldsRadioComponent extends FlogoFormBuilderFieldsBaseComponent {
  _info: any;
  _fieldObserver: any;
  _index: number;

  constructor(translate: LanguageService) {
    super(translate);
  }

}
