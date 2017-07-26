import { Component, Input, SimpleChanges, OnChanges, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { Validators, AbstractControl } from '@angular/forms';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateService } from 'ng2-translate/ng2-translate';


interface KeyValue {
  key: string;
  value: string;
}

interface Setting {
  key: string;
  settings: any
}


@Component({
  selector: 'flogo-apps-settings',
  templateUrl: 'settings.tpl.html',
  styleUrls: ['settings.component.less'],
})
export class FlogoAppSettingsComponent implements OnChanges {
  @ViewChild('modal')
  public modal: ModalComponent;
  public selectedInput: Setting;

  public customSettings:KeyValue[] = [];
  public inputSettings:Setting[] = [
    { key: 'wifi',
      settings: {
        user: 'val1',
        password: 'val2'
      }
    },
    {
      key: 'mqtt',
      settings: {
        user: 'val3',
        port: '8080',
        port1:'8080',
        port2:'8080',
        port3:'8080',
        port4:'8080',
        port5:'8080',
        port6:'8080',
        port7:'8080',
      }
    },
    {
      key: 'other',
      settings: {
      }
    }
  ];

  constructor(public translate: TranslateService) {
    this.resetForm();
  }

  public ngOnChanges(changes: SimpleChanges) {
  }

  public openModal() {
    this.modal.open();
  }

  public addCustom() {
    this.customSettings.push({key: '', value: ''});
  }

  public save() {
  }

  private resetForm() {
  }

  public closeModal() {
    this.modal.close();
  }

  public selectInput(input:Setting) {
    this.selectedInput = input;
  }

}
