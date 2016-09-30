import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {FlogoFormBuilderFieldsBase} from '../fields.base/fields.base.component';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  selector: 'flogo-form-builder-fields-textbox',
  styleUrls: ['fields.textbox.css','../fields.base/fields.base.css'],
  moduleId: module.id,
  templateUrl: 'fields.textbox.tpl.html',
  directives: [ROUTER_DIRECTIVES],
  inputs:['_info:info','_fieldObserver:fieldObserver'],
  pipes: [TranslatePipe]
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
