import {Component, SimpleChange} from '@angular/core';
import {FlogoFormBuilderCommon} from '../../flogo.form-builder/form-builder.common';

@Component({
    selector: 'flogo-form-builder-branch-configuration',
    moduleId: module.id,
    templateUrl: 'form-builder.configuration.branch.tpl.html',
    inputs: ['_fieldObserver:fieldObserver','_attributes:attributes']
})
export class FlogoFormBuilderConfigurationBranchComponent {
  _fieldObserver : any;
  _attributes: any;
  fields:any;

  constructor(private _commonService: FlogoFormBuilderCommon) {
  }

  ngOnInit() {
  }

  ngOnChanges(change: {[propName:string]:SimpleChange}) {
      this.fields =  this._attributes;
  }


  getBranchInfo( branchInfo : any ) {
    var info = {
      name:       'condition',
      id:         branchInfo.id,
      title:      'If',
      value:      branchInfo.condition,
      required:   true,
      placeholder: '',
      isBranch:   true,
      isTrigger: false,
      isTask: false
    };

    return info;
  }



}
