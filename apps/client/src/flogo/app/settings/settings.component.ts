import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { BsModalComponent } from 'ng2-bs3-modal';
import {
  serializeSettings,
  importSettings,
  KeyValue,
  SettingGroup,
  OTHER_CATEGORY,
} from './settings-converter';

@Component({
  selector: 'flogo-apps-settings',
  templateUrl: 'settings.tpl.html',
  styleUrls: ['settings.component.less'],
})
export class FlogoAppSettingsComponent {
  @Input() settings: any;
  @Output() save: EventEmitter<any> = new EventEmitter();
  @ViewChild('modal')
  public modal: BsModalComponent;
  public selectedInput: SettingGroup;
  public hasChanges: boolean;
  public otherItem: KeyValue;

  public customSettings: KeyValue[] = [];
  public inputSettings: SettingGroup[];

  constructor() {
    this.resetForm();
  }

  onSettingsChange() {
    this.hasChanges = true;
  }

  getInput() {
    const settings = this.settings || {};

    this.inputSettings = importSettings(settings);
    const otherFound = this.inputSettings.find(item => item.key === 'other');
    const otherIndex = this.inputSettings.indexOf(otherFound);
    if (otherIndex !== -1) {
      if (otherIndex !== this.inputSettings.length - 1) {
        this.moveItemArray(this.inputSettings, otherIndex, this.inputSettings.length - 1);
      }
    }

    this.customSettings = [];
    const other = this.inputSettings.find(input => input.key === OTHER_CATEGORY);
    this.customSettings = Object.keys(other.settings || {}).map(key => ({
      key,
      value: other.settings[key],
    }));
  }

  public moveItemArray(elements, oldIndex, newIndex) {
    if (newIndex >= elements.length) {
      let k = newIndex - elements.length;
      while (k-- + 1) {
        elements.push(undefined);
      }
    }
    elements.splice(newIndex, 0, elements.splice(oldIndex, 1)[0]);
  }

  public openModal() {
    this.hasChanges = false;
    this.selectedInput = null;
    this.otherItem = { key: '', value: '' };
    this.getInput();
    this.modal.open();
  }

  public addCustom() {
    if (!this.otherItem.key && !this.otherItem.value) {
      return;
    }

    this.customSettings.push({
      key: this.otherItem.key,
      value: this.otherItem.value,
    });
    this.otherItem = { key: '', value: '' };
  }

  public removeCustom(custom) {
    const index = this.customSettings.indexOf(custom);
    if (index !== -1) {
      this.customSettings.splice(index, 1);
      this.hasChanges = true;
    }
  }

  public saveChanges() {
    const otherSettings = {};
    const unvaryingInputs = this.inputSettings.filter(
      input => input.key !== OTHER_CATEGORY
    );
    this.addCustom();
    this.customSettings.forEach(setting => (otherSettings[setting.key] = setting.value));
    const serialized = serializeSettings(
      unvaryingInputs.concat([{ key: OTHER_CATEGORY, settings: otherSettings }])
    );
    this.save.emit(serialized);
    this.closeModal();
  }

  private resetForm() {
    // TODO: why is it empty?
  }

  public closeModal() {
    this.modal.close();
  }

  public selectInput(input: SettingGroup) {
    this.selectedInput = input;
  }
}
