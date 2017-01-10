import { Component, OnChanges, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouteConfig, RouterOutlet, RouteParams, Router, CanActivate } from '@angular/router-deprecated';
import { isConfigurationLoaded } from '../../../common/services/configurationLoaded.service';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';
import { FlogoApplicationDetailsComponent } from '../../flogo.apps.details/components/details.component';
import { FlogoAppListComponent } from '../../flogo.apps.list/components/app.list.component';
import { FlogoMainComponent } from '../../flogo.apps.main/components/main.component';
import { IFlogoApplicationModel } from '../../../common/application.model';

import {
    notification,
} from '../../../common/utils';

import { Contenteditable, JsonDownloader } from '../../../common/directives';
import { FlogoModal } from '../../../common/services/modal.service';


@Component( {
    selector: 'flogo-apps',
    moduleId: module.id,
    directives: [ RouterOutlet, Contenteditable, FlogoAppListComponent ],
    templateUrl: 'apps.tpl.html',
    styleUrls: [ 'apps.component.css' ],
    providers: [ FlogoModal ],
    pipes: [TranslatePipe ]
} )
@CanActivate((next) => {
    return isConfigurationLoaded();
})


@RouteConfig([
    {path: '/apps', name: 'FlogoMain', component: FlogoMainComponent, useAsDefault: true},
    {path: '/apps/:id', name: 'FlogoApplicationDetails', component: FlogoApplicationDetailsComponent }
])

export class FlogoAppsComponent implements  OnInit {
    @ViewChild('appList') appList: ElementRef;

    constructor(
        private _router: Router,
        public translate: TranslateService
    ) {
    }

    ngOnInit() {
    }


    onAddedApp(application:IFlogoApplicationModel) {
    }

    onSelectedApp(application:IFlogoApplicationModel) {
        this._router.navigate([ 'FlogoApplicationDetails', {id: application.id} ]);
    }

    onDeletedApp(application:IFlogoApplicationModel) {
        this._router.navigate([ 'FlogoHome' ]);
    }

}
