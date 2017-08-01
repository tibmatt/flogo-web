import { Component, Input, Output, EventEmitter, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { Validators, AbstractControl } from '@angular/forms';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { serializeSettings, importSettings, KeyValue, Setting, OTHER_CATEGORY } from './settings-converter';


@Component({
  selector: 'flogo-apps-settings',
  templateUrl: 'settings.tpl.html',
  styleUrls: ['settings.component.less'],
})
export class FlogoAppSettingsComponent {
  @Input() settings: any;
  @Output() save: EventEmitter<any> = new EventEmitter();
  @ViewChild('modal')
  public modal: ModalComponent;
  public selectedInput: Setting;
  public hasChanges: boolean;
  public otherItem: KeyValue;


  public customSettings:KeyValue[] = [];
  public inputSettings:Setting[];

  constructor(public translate: TranslateService) {
    this.resetForm();
  }

  onSettingsChange() {
    this.hasChanges = true;
  }

  getInput() {
    const settings = this.settings || {};

    this.inputSettings = importSettings(settings);
    const otherFound = this.inputSettings.find((item) => item.key === 'other');
    const otherIndex = this.inputSettings.indexOf(otherFound);
    if(otherIndex !== -1) {
      if(otherIndex !== this.inputSettings.length -1) {
        this.moveItemArray(this.inputSettings, otherIndex, this.inputSettings.length -1);
      }
    }

    this.customSettings = [];
    const other =  this.inputSettings.find((input) => input.key === OTHER_CATEGORY);
    for(var key in (other.settings || {})) {
      this.customSettings.push({key, value: other.settings[key]});
    }
  }

  public moveItemArray(elements, oldIndex, newIndex) {
    if (newIndex >= elements.length) {
      var k = newIndex - elements.length;
      while ((k--) + 1) {
        elements.push(undefined);
      }
    }
    elements.splice(newIndex, 0, elements.splice(oldIndex, 1)[0]);
  };

  public openModal() {
    this.hasChanges = false;
    this.selectedInput = null;
    this.otherItem = { key: '', value: ''};
    this.getInput();
    this.modal.open();
  }

  public addCustom() {
    if(!this.otherItem.key && !this.otherItem.value) {
      return;
    }

    this.customSettings.push({key: this.otherItem.key, value: this.otherItem.value});
    this.otherItem = {key: '', value: ''};
  }

  public removeCustom(custom) {
    const index = this.customSettings.indexOf(custom);
    if(index !== -1) {
      this.customSettings.splice(index, 1);
      this.hasChanges = true;
    }
  }

  public saveChanges() {
    const otherSettings = {};
    const input =  this.inputSettings.filter((input) => input.key !== OTHER_CATEGORY);

    this.customSettings.forEach((setting) => otherSettings[setting.key] =  setting.value);

    const databaseFormat = serializeSettings(input.concat([{key: OTHER_CATEGORY, settings: otherSettings}]));
    this.save.emit(databaseFormat);
    this.closeModal();
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
