import { Component, Input } from '@angular/core';
import { FormActionsModels, FormDescriptionsModels } from './../../flogo.form/models';


@Component({
  selector: 'flogo-form-trigger',
  // moduleId: module.id,
  styleUrls: ['form.trigger.less'],
  templateUrl: 'form.trigger.tpl.html'
})
// todo: used?
export class FlogoFormTriggerComponent {
  @Input() descriptions: FormDescriptionsModels;
  @Input() actions: FormActionsModels[];

  constructor() {
  }

  changeDescriptions(evt, field) {
    // alert('Changing');
  }

}
