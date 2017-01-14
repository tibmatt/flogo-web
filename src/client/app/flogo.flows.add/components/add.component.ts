import { FlogoFlowsFlowNameComponent } from './../../flogo.flows.flow-name/components/flow-name.component';
import { Component, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { PostService } from '../../../common/services/post.service';
import { RESTAPIFlowsService } from '../../../common/services/restapi/flows-api.service';
import { notification } from '../../../common/utils';
import { PUB_EVENTS } from '../message';
import { UniqueNameValidator } from './../validators/unique-name.validator';


@Component({
    selector: 'flogo-flows-add',
    moduleId: module.id,
    templateUrl: 'add.tpl.html',
    styleUrls: ['add.component.css']
})
export class FlogoFlowsAdd {
  @Input()
  public appId: string;
  @ViewChild('modal')
  public modal: ModalComponent;
  public flow: FormGroup;

    constructor(public translate: TranslateService,
      private _postService: PostService,
      private flowsService: RESTAPIFlowsService,
      private formBuilder: FormBuilder
    ) {
      this.resetForm();
    }

    private resetForm() {
      this.flow = this.formBuilder.group({
        name: ['', [],
          Validators.composeAsync([
            (control: AbstractControl) => Promise.resolve(Validators.required(control)),
            UniqueNameValidator.make(this.flowsService)
          ])
        ],
        description: ['']
      });
    }

    public createFlow({ value, valid }: { value: { name: string, description?: string }, valid: boolean }) {
      this._postService.publish(_.assign({}, PUB_EVENTS.addFlow, {data: value}));
      this.closeAddFlowModal();
    }

    public closeAddFlowModal() {
        this.resetForm();
        this.modal.close();
    }

}
