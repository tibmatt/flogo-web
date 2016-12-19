import { Component, OnChanges, OnInit } from '@angular/core';
import { CanActivate,  RouteParams } from '@angular/router-deprecated';
import { isConfigurationLoaded } from '../../../common/services/configurationLoaded.service';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';
import { IFlogoApplicationModel } from '../../../common/application.model';

import {
    notification,
} from '../../../common/utils';

import { Contenteditable, JsonDownloader } from '../../../common/directives';
import { FlogoModal } from '../../../common/services/modal.service';


@Component( {
    selector: 'flogo-app-details',
    moduleId: module.id,
    directives: [ Contenteditable ],
    templateUrl: 'details.tpl.html',
    styleUrls: [ 'details.component.css' ],
    providers: [ FlogoModal ],
    pipes: [TranslatePipe]
} )
@CanActivate((next) => {
    return isConfigurationLoaded();
})



export class FlogoApplicationDetailsComponent /*implements OnActivate*/  {
    application: IFlogoApplicationModel = null;

    constructor(
        private _flogoModal: FlogoModal,
        private _routeParams: RouteParams,
        public translate: TranslateService
    ) {
        this.application = <IFlogoApplicationModel> this._routeParams.params['application'];
    }

}
