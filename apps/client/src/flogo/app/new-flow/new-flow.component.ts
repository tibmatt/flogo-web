import { Component, HostBinding, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { APIFlowsService } from '../../core/services/restapi/v2/flows-api.service';
import { UniqueNameValidator } from './unique-name.validator';
import { MODAL_TOKEN, modalAnimate, ModalControl } from '@flogo-web/client/core/modal';

export interface NewFlowData {
  appId: string;
  triggerId?: string;
}

@Component({
  selector: 'flogo-new-flow',
  templateUrl: 'new-flow.component.html',
  styleUrls: ['new-flow.component.less'],
  animations: modalAnimate,
})
export class FlogoNewFlowComponent {
  @HostBinding('@modalAnimate')
  public flow: FormGroup;
  private triggerId: string;

  constructor(
    private flowsService: APIFlowsService,
    private formBuilder: FormBuilder,
    @Inject(MODAL_TOKEN) public newFlowData: NewFlowData,
    public control: ModalControl
  ) {
    this.resetForm();
  }

  public createFlow({ value }: { value: { name: string; description?: string } }) {
    this.control.close({
      triggerId: this.newFlowData.triggerId,
      name: value.name,
      description: value.description,
    });
    this.resetForm();
  }

  public closeAddFlowModal() {
    this.resetForm();
    this.newFlowData.triggerId = null;
    this.control.close();
  }

  private resetForm() {
    this.flow = this.formBuilder.group({
      name: [
        '',
        [],
        Validators.composeAsync([
          // we need to wrap into a compose async validator, otherwise async validators overwrite sync validators
          (control: AbstractControl) => Promise.resolve(Validators.required(control)),
          UniqueNameValidator.make(this.flowsService, this.newFlowData.appId),
        ]),
      ],
      description: [''],
    });
  }
}
