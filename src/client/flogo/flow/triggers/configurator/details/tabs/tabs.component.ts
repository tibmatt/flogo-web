import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TriggerConfigureTab, TriggerConfigureTabType} from '@flogo/flow/core/interfaces/trigger-configure';

@Component({
  selector: 'flogo-triggers-configuration-details-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.less']
})
export class TabsComponent {
  @Input()
  tabs: TriggerConfigureTab;
  @Input()
  currentTabType: TriggerConfigureTabType;
  @Output()
  selectTab = new EventEmitter<TriggerConfigureTabType>();

  setCurrentView(tabType: TriggerConfigureTabType) {
    if (this.currentTabType !== tabType) {
      this.selectTab.emit(tabType);
    }
  }
}
