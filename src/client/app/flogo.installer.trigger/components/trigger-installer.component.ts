import { Component, EventEmitter, OnChanges, SimpleChange, ViewChild } from '@angular/core';
import { FlogoInstallerCategorySelectorComponent } from '../../flogo.installer.category-selector/components/category-selector.component';
import { FlogoInstallerListViewComponent } from '../../flogo.installer.list-view/components/list-view.component';
import { FlogoInstallerBaseComponent } from '../../flogo.installer.base/components/base-installer.component';

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

  constructor() {
    super();
  }

  // override
  getInstallables() {
    // TODO replace these mock data.
    return [
      {
        name : 'tibco-coap',
        title : 'CoAP Trigger',
        description : 'Simple CoAP Trigger',
        version : '0.0.1',
        where : 'github.com/TIBCOSoftware/flogo-contrib/trigger/coap',
        icon : '',
        author : 'Francisco Martinez',
        createTime : new Date( '2016-05' ).getTime(),
        updateTime : Date.now(),
        isInstalled : false
      },
      {
        name : 'tibco-mqtt',
        title : 'MQTT Trigger',
        description : 'Simple MQTT Trigger',
        version : '0.0.1',
        where : 'github.com/TIBCOSoftware/flogo-contrib/trigger/mqtt',
        icon : '',
        author : 'Michael Register',
        createTime : new Date( '2016-02' ).getTime(),
        updateTime : Date.now(),
        isInstalled : true
      },
      {
        name : 'tibco-rest',
        title : 'REST Trigger',
        description : 'Simple REST Trigger',
        version : '0.0.1',
        where : 'github.com/TIBCOSoftware/flogo-contrib/trigger/rest',
        icon : '',
        author : 'Francisco Martinez',
        createTime : new Date( '2016-01' ).getTime(),
        updateTime : Date.now(),
        isInstalled : true
      },
      {
        name : 'tibco-timer',
        title : 'Timer Trigger',
        description : 'Simple Timer trigger',
        version : '0.0.1',
        where : 'github.com/TIBCOSoftware/flogo-contrib/trigger/timer',
        icon : '',
        author : 'Francisco Martinez',
        createTime : new Date( '2016-04' ).getTime(),
        updateTime : Date.now(),
        isInstalled : false
      }
    ];
  }
}
