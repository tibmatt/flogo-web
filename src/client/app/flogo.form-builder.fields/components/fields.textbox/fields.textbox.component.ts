import {Component} from '@angular/core';
import {FlogoFormBuilderFieldsBase} from '../fields.base/fields.base.component';
import {TranslateService} from 'ng2-translate/ng2-translate';

@Component({
  selector: 'flogo-form-builder-fields-textbox',
  styleUrls: ['fields.textbox.less','../fields.base/fields.base.less'],
  // moduleId: module.id,
  templateUrl: 'fields.textbox.tpl.html',
  inputs:['_info:info','_fieldObserver:fieldObserver']
})

export class FlogoFormBuilderFieldsTextBox  extends FlogoFormBuilderFieldsBase {
  _info:any;
  _fieldObserver:any;


  constructor(public translate: TranslateService) {
    super(translate);
  }

  ngOnInit() {

  }

}
