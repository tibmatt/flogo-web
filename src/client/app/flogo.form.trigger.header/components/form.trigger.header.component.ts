import { Component, Input } from '@angular/core';
import { FormActionsModels, FormDescriptionsModels } from './../../flogo.form/models';


@Component({
  selector: 'flogo-form-trigger-header',
  // moduleId: module.id,
  styleUrls: ['form.trigger.header.less'],
  templateUrl: 'form.trigger.header.tpl.html'
})
// todo: used?
export class FlogoFormTriggerHeaderComponent {
  @Input() descriptions: FormDescriptionsModels;
  @Input() actions: FormActionsModels[];

  constructor() {
  }

  changeDescriptions(evt, field) {
    // alert('Changing');
  }

}
