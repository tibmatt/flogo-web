import { Component, OnInit } from '@angular/core';
import { RESTAPIApplicationsService } from '../../../common/services/restapi/applications-api.service';
import { IFlogoApplicationModel, IFlogoApplicationFlowModel } from '../../../common/application.model';

import { FlogoModal } from '../../../common/services/modal.service';
import {flogoIDEncode} from "../../../common/utils";


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

    constructor(
        private _flogoModal: FlogoModal,
        public applicationServiceAPI: RESTAPIApplicationsService
    ) {
    }

    ngOnInit() {
        this.applicationServiceAPI.recentFlows()
            .then((flows: Array<any>)=> {
              flows = flows.length <= 5 ? flows : _.slice(flows, 0, 5);
              this.recent = _.forEach(flows, flow=>{flow.encodedId = flogoIDEncode(flow.id)})
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
        let flows = _.clone(this.originalFlows || []);
        return _.forEach(flows, function (flow:any) {
          flow.createdAt = flow.created_at;
          delete flow.created_at;
        });
    }

}
