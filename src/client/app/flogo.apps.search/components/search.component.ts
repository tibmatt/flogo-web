import { Component, Output, EventEmitter, DoCheck } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  selector: 'flogo-apps-search',
  // moduleId: module.id,
  templateUrl: 'search.tpl.html',
  styleUrls: ['search.component.less']
})
export class FlogoApplicationSearchComponent implements DoCheck {
  public placeholder = '';
  @Output() changedSearch: EventEmitter<string> = new EventEmitter<string>();

  constructor(public translate: TranslateService) {
  }

  ngDoCheck() {
    this.placeholder = this.translate.instant('FLOWS:SEARCH');
  }

  onSearchInputChanged(events) {
    this.changedSearch.emit(events.target.value);
  }


}
