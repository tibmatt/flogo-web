import { Component, HostBinding, Inject, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { MODAL_TOKEN, modalAnimate, ModalControl } from '@flogo-web/lib-client/modal';
import { ResourceService, ResourcePluginManifest } from '@flogo-web/lib-client/core';

import { RESOURCE_PLUGINS_CONFIG } from '../../core';
import { UniqueNameValidator } from './unique-name.validator';

export interface NewResourceData {
  appId: string;
  triggerId?: string;
}

@Component({
  selector: 'flogo-new-resource',
  templateUrl: 'new-resource.component.html',
  styleUrls: ['new-resource.component.less'],
  animations: modalAnimate,
})
export class NewResourceComponent {
  @HostBinding('@modalAnimate')
  public resource: FormGroup;
  private triggerId: string;

  constructor(
    @Inject(RESOURCE_PLUGINS_CONFIG) public resourceTypes: ResourcePluginManifest[],
    @Inject(MODAL_TOKEN) private newFlowData: NewResourceData,
    private resourceService: ResourceService,
    private formBuilder: FormBuilder,
    public control: ModalControl
  ) {
    this.resetForm();
  }

  public createFlow({
    value,
  }: {
    value: { name: string; description?: string; type: string };
  }) {
    this.control.close({
      triggerId: this.newFlowData.triggerId,
      name: value.name,
      description: value.description,
      type: value.type,
    });
    this.resetForm();
  }

  @HostListener('document:keydown.escape')
  public closeAddFlowModal() {
    this.resetForm();
    this.newFlowData.triggerId = null;
    this.control.close();
  }

  private resetForm() {
    const [defaultTypeInfo] = this.resourceTypes;
    this.resource = this.formBuilder.group({
      name: [
        '',
        [],
        Validators.composeAsync([
          // we need to wrap into a compose async validator, otherwise async validators overwrite sync validators
          (control: AbstractControl) => Promise.resolve(Validators.required(control)),
          UniqueNameValidator.make(this.resourceService, this.newFlowData.appId),
        ]),
      ],
      description: [''],
      type: [defaultTypeInfo.type, Validators.required],
    });
  }
}
