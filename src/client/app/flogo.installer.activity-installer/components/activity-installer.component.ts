import { Component, EventEmitter, OnChanges, SimpleChange, ViewChild } from '@angular/core';
import { FlogoInstallerCategorySelectorComponent } from '../../flogo.installer.category-selector/components/category-selector.component';
import { FlogoInstallerListViewComponent } from '../../flogo.installer.list-view/components/list-view.component';
import { FlogoInstallerBaseComponent } from '../../flogo.installer.base-installer/components/base-installer.component';

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

  constructor() {
    super();
  }

  // override
  getInstallables() {
    // TODO replace these mock data.
    return [
      {
        name : 'tibco-awsiot',
        title : 'AWS IoT Activity',
        description : 'Simple AWS IoT Activity',
        version : '0.0.1',
        where : 'github.com/TIBCOSoftware/flogo-contrib/activity/awsiot',
        icon : '',
        author : 'Francisco Martinez',
        createTime : new Date( '2016-05' ).getTime(),
        updateTime : Date.now(),
        isInstalled : false
      },
      {
        name : 'tibco-coap',
        title : 'CoAP Activity',
        description : 'Simple CoAP Activity',
        version : '0.0.1',
        where : 'github.com/TIBCOSoftware/flogo-contrib/activity/coap',
        icon : '',
        author : 'Francisco Martinez',
        createTime : new Date( '2016-05' ).getTime(),
        updateTime : Date.now(),
        isInstalled : false
      },
      {
        name : 'tibco-counter',
        title : 'Counter Activity',
        description : 'Simple Global Counter Activity',
        version : '0.0.1',
        where : 'github.com/TIBCOSoftware/flogo-contrib/activity/counter',
        icon : '',
        author : 'Francisco Martinez',
        createTime : new Date( '2016-04' ).getTime(),
        updateTime : Date.now(),
        isInstalled : true
      },
      {
        name : 'tibco-log',
        title : 'Log Activity',
        description : 'Simple Log Activity',
        version : '0.0.1',
        where : 'github.com/TIBCOSoftware/flogo-contrib/activity/log',
        icon : '',
        author : 'Francisco Martinez',
        createTime : new Date( '2016-01' ).getTime(),
        updateTime : Date.now(),
        isInstalled : true
      },
      {
        name : 'tibco-rest',
        title : 'REST Activity',
        description : 'Simple REST Activity',
        version : '0.0.1',
        where : 'github.com/TIBCOSoftware/flogo-contrib/activity/rest',
        icon : '',
        author : 'Francisco Martinez',
        createTime : new Date( '2016-01' ).getTime(),
        updateTime : Date.now(),
        isInstalled : true
      },
      {
        name : 'tibco-twilio',
        title : 'Twilio Activity',
        description : 'Simple Twilio Activity',
        version : '0.0.1',
        where : 'github.com/TIBCOSoftware/flogo-contrib/activity/twilio',
        icon : '',
        author : 'Francisco Martinez',
        createTime : new Date( '2016-04' ).getTime(),
        updateTime : Date.now(),
        isInstalled : true
      }
    ];
  }
}
