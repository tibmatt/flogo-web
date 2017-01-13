import { Component, OnInit } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { RESTAPIApplicationsService } from '../../../common/services/restapi/applications-api.service';
import { IFlogoApplicationModel, IFlogoApplicationFlowModel } from '../../../common/application.model';

import { FlogoModal } from '../../../common/services/modal.service';


@Component( {
    selector: 'flogo-apps-main',
    moduleId: module.id,
    templateUrl: 'main.tpl.html',
    styleUrls: [ 'main.component.css' ]
} )
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
        this.searchPlaceHolder = this.translate.instant('FLOWS:SEARCH');
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
