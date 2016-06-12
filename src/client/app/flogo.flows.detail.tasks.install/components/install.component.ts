import {Component} from '@angular/core';

import {PUB_EVENTS} from '../../flogo.flows.detail.tasks/messages';
import {SUB_EVENTS} from "../../flogo.flows.detail.tasks/messages";

import {RESTAPIService} from "../../../common/services/rest-api.service";
import {PostService} from "../../../common/services/post.service";
import { FlogoInstallerComponent } from '../../flogo.installer/components/installer.component';

@Component({
  selector: 'flogo-flows-detail-tasks-install',
  directives: [FlogoInstallerComponent],
  moduleId: module.id,
  templateUrl: 'install.tpl.html',
})
export class InstallComponent {

  public activities:any[] = [];
  private isActivated = false;

  constructor(private _restApiService:RESTAPIService, private _postService:PostService) {
    this.isActivated = false;
    this._loadActivities();
  }

  public install(activity:any) {

    this._restApiService.activities
      .install([{
        name: activity.name,
        version: activity.version
      }])
      .then(() => {
        this._loadActivities();
        this._postService.publish(
          _.assign(
            {}, SUB_EVENTS.installActivity, {
              data: {}
            }
          )
        );


      });

  }

  private _loadActivities() {
    this._restApiService.activities.getAll()
      .then((activities:any) => this.activities = activities);
  };

  private openModal() {
    this.isActivated = true;
  }

}
