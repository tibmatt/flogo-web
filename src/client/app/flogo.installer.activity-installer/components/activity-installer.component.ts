import { Component } from '@angular/core';
import { FlogoInstallerCategorySelectorComponent } from '../../flogo.installer.category-selector/components/category-selector.component';
import { FlogoInstallerListViewComponent } from '../../flogo.installer.list-view/components/list-view.component';
import { FlogoInstallerBaseComponent } from '../../flogo.installer.base-installer/components/base-installer.component';
import { RESTAPIActivitiesService } from '../../../common/services/restapi/activities-api.service';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';

import {
  FLOGO_INSTALLER_STATUS_INSTALL_SUCCESS,
  FLOGO_INSTALLER_STATUS_INSTALL_FAILED
} from '../../flogo.installer/constants';

@Component( {
  selector : 'flogo-installer-activity',
  moduleId : module.id,
  directives : [
    FlogoInstallerCategorySelectorComponent,
    FlogoInstallerListViewComponent
  ],
  templateUrl : 'activity-installer.tpl.html',
  inputs : [ 'query: flogoSearchQuery', 'status: flogoInstallerStatus' ],
  styleUrls : [ 'activity-installer.component.css' ],
  pipes: [TranslatePipe]
} )
export class FlogoInstallerActivityComponent extends FlogoInstallerBaseComponent {

  constructor( private _restAPIActivitiesService : RESTAPIActivitiesService,
               public translate: TranslateService) {
    super(translate);

    this.init();
  }

  // override
  getInstallables() {
    return this._restAPIActivitiesService.getActivities()
      .then( ( activities ) => {
        return _.map( activities, ( activity : any ) => {
          return {
            name : activity.name,
            title : activity.title,
            description : activity.description,
            version : activity.version,
            where : activity.where,
            icon : activity.icon,
            author : activity.author,
            createTime : activity.createTime || Date.now(),
            updateTime : activity.updateTime || Date.now(),
            isInstalled : activity.installed || false
          }
        } );
      } );
  }

  // override
  onInstallerStatusChange( status: string) {
    if (status === FLOGO_INSTALLER_STATUS_INSTALL_SUCCESS || status === FLOGO_INSTALLER_STATUS_INSTALL_FAILED) {
      this.updateData();
    }
  }
}
