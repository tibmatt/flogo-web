import {Component} from '@angular/core';

import {PUB_EVENTS, SUB_EVENTS} from '../../flogo.flows.detail.triggers/messages';

import {RESTAPIService} from "../../../common/services/rest-api.service";
import {PostService} from "../../../common/services/post.service";

import {TRIGGERS as MOCK_TRIGGERS} from "../../flogo.flows.detail.triggers/mocks/triggers"
import { FlogoInstallerComponent } from '../../flogo.installer/components/installer.component';

@Component({
  selector: 'flogo-flows-detail-triggers-install',
  directives: [FlogoInstallerComponent],
  moduleId: module.id,
  templateUrl: 'install.tpl.html',
})
export class FlogoFlowsDetailTriggersInstallComponent {

  public triggers:any[] = [];
  private isActivated = false;

  constructor(private _restApiService:RESTAPIService, private _postService:PostService) {
    this.isActivated = false;
    this.triggers = MOCK_TRIGGERS;
    //this._loadTriggers();
  }

  public install(trigger:any) {

    this._restApiService.triggers
      .install([{
        name: trigger.name,
        version: trigger.version
      }])
      .then(() => {
        this._loadTriggers();
        this._postService.publish(
          _.assign(
            {}, SUB_EVENTS.installTrigger, {
              data: {}
            }
          )
        );


      });

  }

  private _loadTriggers() {
    this._restApiService.triggers.getAll()
      .then((triggers:any) => this.triggers = triggers);
  };
  
  private openModal() {
    this.isActivated = true;
  }

}
