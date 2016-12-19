import { Component, OnChanges } from '@angular/core';
import { CanActivate } from '@angular/router-deprecated';
import { isConfigurationLoaded } from '../../../common/services/configurationLoaded.service';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';

import {
    notification,
} from '../../../common/utils';

import { Contenteditable, JsonDownloader } from '../../../common/directives';
import { FlogoModal } from '../../../common/services/modal.service';


@Component( {
    selector: 'flogo-app-add',
    moduleId: module.id,
    directives: [ Contenteditable ],
    templateUrl: 'add.tpl.html',
    styleUrls: [ 'add.component.css' ],
    providers: [ FlogoModal ],
    pipes: [TranslatePipe]
} )
@CanActivate((next) => {
    return isConfigurationLoaded();
})


export class FlogoApplicationAddComponent {
    constructor(
        private _flogoModal: FlogoModal,
        public translate: TranslateService
    ) {
        console.log('Hello flogo app component');
    }

}
