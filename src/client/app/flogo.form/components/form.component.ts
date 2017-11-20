import { Component, OnInit } from '@angular/core';
import { FormActionsModels, FormDescriptionsModels } from './../models';


@Component({
  selector: 'flogo-form',
  // moduleId: module.id,
  styleUrls: ['form.less'],
  templateUrl: 'form.tpl.html'
})
export class FlogoFormComponent implements OnInit {
  name: string;
  title: string;
  descriptions: FormDescriptionsModels;
  actions: FormActionsModels[];

  constructor() {
  }

  ngOnInit() {

    this.descriptions = {
      name: 'http Request',
      isEditableName: true,
      details: '6 Flows use trigger',
      isEditableDetails: false
    };

    this.actions = [
      {
        title: 'Run from tile',
        enabled: true
      },
      {
        title: 'Run from start',
        enabled: false
      }
    ];
  }

}
