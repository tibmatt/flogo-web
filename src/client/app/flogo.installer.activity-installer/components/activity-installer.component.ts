import { Component } from '@angular/core';
import { FlogoInstallerCategorySelectorComponent } from '../../flogo.installer.category-selector/components/category-selector.component';
import { FlogoInstallerListViewComponent } from '../../flogo.installer.list-view/components/list-view.component';
import { FlogoInstallerBaseComponent } from '../../flogo.installer.base-installer/components/base-installer.component';
import { RESTAPIActivitiesService } from '../../../common/services/restapi/activities-api.service';

@Component( {
  selector : 'flogo-installer-activity',
  moduleId : module.id,
  directives : [
    FlogoInstallerCategorySelectorComponent,
    FlogoInstallerListViewComponent
  ],
  templateUrl : 'activity-installer.tpl.html',
  inputs : [ 'query: flogoSearchQuery' ],
  styleUrls : [ 'activity-installer.component.css' ]
} )
export class FlogoInstallerActivityComponent extends FlogoInstallerBaseComponent {

  constructor( private _restAPIActivitiesService : RESTAPIActivitiesService ) {
    super();

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
}
