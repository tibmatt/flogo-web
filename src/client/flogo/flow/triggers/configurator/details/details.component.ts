import {Component, Input, OnChanges} from '@angular/core';
import {ConfigureTriggerDetails} from '../interfaces';
import {TriggerConfigureTabType} from '@flogo/flow/core';
import {ConfigureDetailsService} from './details.service';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'flogo-triggers-configuration-details',
  templateUrl: 'details.component.html',
  styleUrls: ['details.component.less'],
  providers: [ConfigureDetailsService]
})
export class ConfigureDetailsComponent implements OnChanges {
  @Input()
  details: ConfigureTriggerDetails;
  currentTabType: TriggerConfigureTabType;
  settingsForm: FormGroup;

  constructor(private detailsService: ConfigureDetailsService) {}

  ngOnChanges() {
    this.currentTabType = 'settings';
    this.settingsForm = this.detailsService.generateSettingsForm(this.details.fields.settings, this.details.schema);
  }

  changeTabView(selectedTab: TriggerConfigureTabType) {
    this.currentTabType = selectedTab;
  }
}
