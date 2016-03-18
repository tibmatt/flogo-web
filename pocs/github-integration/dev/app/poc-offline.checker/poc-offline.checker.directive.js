import {Component} from 'angular2/core';
import {OfflineCheckerService} from '../poc-offline.checker/poc-offline.checker.service';

@Component({
  selector: 'poc-offline-checker',
  templateUrl: './poc-offline.checker/templates/poc-offline.checker.template.html',
  providers: [OfflineCheckerService]
})
export class OfflineCheckerDirective {
  online;
  _offlineCheckerService;

  static get parameters() {
    return [[OfflineCheckerService]]
  }

  constructor(offlineCheckerService ) {
    this.online = 'online';
    this._offlineCheckerService = offlineCheckerService;
  }

  ngOnInit() {
    this._offlineCheckerService.timerStream.subscribe((state) => { this.online = state; });
  }


  static get dependencies() {
    return [[]];
  }


}
