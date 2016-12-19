import { Component, OnChanges } from '@angular/core';
import { RouteConfig, RouterOutlet, RouteParams, Router, CanActivate } from '@angular/router-deprecated';
import { isConfigurationLoaded } from '../../../common/services/configurationLoaded.service';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';
import { FlogoApplicationAddComponent } from '../../flogo.app.add/components/add.component';

import {
    notification,
} from '../../../common/utils';

import { Contenteditable, JsonDownloader } from '../../../common/directives';
import { FlogoModal } from '../../../common/services/modal.service';


@Component( {
    selector: 'flogo-home',
    moduleId: module.id,
    directives: [ RouterOutlet, Contenteditable, FlogoApplicationAddComponent ],
    templateUrl: 'home.tpl.html',
    styleUrls: [ 'home.component.css' ],
    providers: [ FlogoModal ],
    pipes: [TranslatePipe]
} )
@CanActivate((next) => {
    console.log('loading.....');
    return isConfigurationLoaded();
})


@RouteConfig([
    {path: '/', name: 'FlogoApplicationAdd', component: FlogoApplicationAddComponent, useAsDefault: true}
])

export class FlogoHomeComponent {

    constructor(
        private _router: Router,
        private _flogoModal: FlogoModal,
        private _routerParams: RouteParams,
        public translate: TranslateService
    ) {
        console.log('Hello flogo home component');
    }

}
