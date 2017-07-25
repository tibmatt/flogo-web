import { Component, Input, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateService } from 'ng2-translate/ng2-translate';


@Component({
  selector: 'flogo-apps-settings',
  templateUrl: 'settings.tpl.html',
  styleUrls: ['settings.component.less']
})
export class FlogoAppSettingsComponent implements OnChanges {
  @ViewChild('modal')
  public modal: ModalComponent;
  public settings: FormGroup;

  constructor(public translate: TranslateService,
              public formBuilder: FormBuilder) {
    this.resetForm();
  }

  public ngOnChanges(changes: SimpleChanges) {
  }

  public openModal() {
    this.modal.open();
  }

  public save() {
    alert('Saving changes');
  }

  private resetForm() {
    this.settings = this.formBuilder.group({
      name: [''],
      description: ['']
    });
  }

  public closeModal() {
    this.modal.close();
  }

}
