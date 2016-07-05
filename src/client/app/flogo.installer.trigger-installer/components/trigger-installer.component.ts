import { Component } from '@angular/core';
import { FlogoInstallerCategorySelectorComponent } from '../../flogo.installer.category-selector/components/category-selector.component';
import { FlogoInstallerListViewComponent } from '../../flogo.installer.list-view/components/list-view.component';
import { FlogoInstallerBaseComponent } from '../../flogo.installer.base-installer/components/base-installer.component';
import { RESTAPITriggersService } from '../../../common/services/restapi/triggers-api.service';

@Component( {
  selector : 'flogo-installer-trigger',
  moduleId : module.id,
  directives : [
    FlogoInstallerCategorySelectorComponent,
    FlogoInstallerListViewComponent
  ],
  templateUrl : 'trigger-installer.tpl.html',
  inputs : [ 'query: flogoSearchQuery' ],
  styleUrls : [ 'trigger-installer.component.css' ]
} )
export class FlogoInstallerTriggerComponent extends FlogoInstallerBaseComponent {

  constructor(private _restAPITriggersService : RESTAPITriggersService) {
    super();

    this.init();
  }

  // override
  getInstallables() {
    return this._restAPITriggersService.getTriggers()
      .then( ( triggers ) => {
        return _.map( triggers, ( trigger : any ) => {
          return {
            name : trigger.name,
            title : trigger.title,
            description : trigger.description,
            version : trigger.version,
            where : trigger.where,
            icon : trigger.icon,
            author : trigger.author,
            createTime : trigger.createTime || Date.now(),
            updateTime : trigger.updateTime || Date.now(),
            isInstalled : trigger.installed || false
          }
        } );
      } );
  }
}
