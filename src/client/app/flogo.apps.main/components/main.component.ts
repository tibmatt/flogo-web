import { Component, OnChanges, OnInit } from '@angular/core';
import { CanActivate } from '@angular/router-deprecated';
import { isConfigurationLoaded } from '../../../common/services/configurationLoaded.service';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';
import { RESTAPIApplicationsService } from '../../../common/services/restapi/applications-api.service';
import { FlogoApplicationSearch } from '../../flogo.apps.search/components/search.component';
import { FlogoApplicationFlowsComponent } from '../../flogo.apps.flows/components/flows.component';
import { IFlogoApplicationModel, IFlogoApplicationFlowModel } from '../../../common/application.model';

import {
    notification,
} from '../../../common/utils';

import { FlogoModal } from '../../../common/services/modal.service';


@Component( {
    selector: 'flogo-main',
    moduleId: module.id,
    templateUrl: 'main.tpl.html',
    styleUrls: [ 'main.component.css' ],
    providers: [ FlogoModal, RESTAPIApplicationsService ],
    pipes: [TranslatePipe],
    directives: [FlogoApplicationSearch, FlogoApplicationFlowsComponent]
} )
@CanActivate((next) => {

    return isConfigurationLoaded();
})


export class FlogoMainComponent implements OnInit {
    public recent : Array<any> = [];
    flows: Array<IFlogoApplicationFlowModel> = [];
    originalFlows: Array<IFlogoApplicationFlowModel> = [];
    application: IFlogoApplicationModel = null;
    searchPlaceHolder:string = '';
    constructor(
        private _flogoModal: FlogoModal,
        public translate: TranslateService,
        public applicationServiceAPI: RESTAPIApplicationsService
    ) {
    }

    ngOnInit() {
        this.searchPlaceHolder = this.translate.get('FLOWS:SEARCH')['value'];
        this.applicationServiceAPI.recentFlows()
            .then((flows: Array<any>)=> {
                this.recent = flows;
            });

        this.applicationServiceAPI.allFlows()
            .then((flows: Array<IFlogoApplicationFlowModel>)=> {
                this.originalFlows = flows;
                this.flows = this.getOriginalFlows();
            });

    }

    onChangedSearch(search) {
        let flows = this.originalFlows || [];

        if(search && flows.length){
            let filtered =  flows.filter((flow:IFlogoApplicationFlowModel)=> {
                return (flow.name || '').toLowerCase().includes(search.toLowerCase()) ||
                    (flow.description || '').toLowerCase().includes(search.toLowerCase())
            });

            this.flows = filtered || [];

        }else {
            this.flows = this.getOriginalFlows();
        }
    }

    getOriginalFlows() {
        return _.clone(this.originalFlows || []);
    }

}
