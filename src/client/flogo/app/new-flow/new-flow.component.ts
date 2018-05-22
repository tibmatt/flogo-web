import { Component, Input, SimpleChanges, OnChanges, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { BsModalComponent } from 'ng2-bs3-modal';

import { PostService } from '../../core/services/post.service';
import { APIFlowsService } from '../../core/services/restapi/v2/flows-api.service';
import { UniqueNameValidator } from './unique-name.validator';


@Component({
    selector: 'flogo-new-flow',
    // moduleId: module.id,
    templateUrl: 'new-flow.component.html',
    styleUrls: ['new-flow.component.less']
})
export class FlogoNewFlowComponent implements OnChanges {
  @ViewChild('modal') public modal: BsModalComponent;
  @Input()  public appId: string;
  @Output() public newFlow = new EventEmitter();
  public flow: FormGroup;
  private triggerId: string;

  constructor(
    private postService: PostService,
    private flowsService: APIFlowsService,
    private formBuilder: FormBuilder,
  ) {
    this.resetForm();
  }

  public ngOnChanges(changes: SimpleChanges) {
    const appIdChange = changes['appId'];
    if (appIdChange && appIdChange.currentValue !== appIdChange.previousValue) {
      this.resetForm();
    }
  }

  public open(triggerId?) {
    this.triggerId = triggerId;
    this.resetForm();
    this.modal.open();
  }

  public createFlow({ value, valid }: { value: { name: string, description?: string }, valid: boolean }) {
    this.newFlow.emit({
      triggerId: this.triggerId,
      name: value.name,
      description: value.description,
    });
    this.closeAddFlowModal();
  }

  public closeAddFlowModal() {
    this.resetForm();
    this.triggerId = null;
    this.modal.close();
  }

  private resetForm() {
    this.flow = this.formBuilder.group({
      name: ['', [],
        Validators.composeAsync([
          // we need to wrap into a compose async validator, otherwise async validators overwrite sync validators
          (control: AbstractControl) => Promise.resolve(Validators.required(control)),
          UniqueNameValidator.make(this.flowsService, this.appId)
        ])
      ],
      description: ['']
    });
  }
}
