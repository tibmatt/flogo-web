import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RESTAPIApplicationsService } from '../../../common/services/restapi/applications-api.service';
import { IFlogoApplicationModel, IFlogoApplicationFlowModel } from '../../../common/application.model';
import { RESTAPIFlowsService } from '../../../common/services/restapi/flows-api.service';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { FlogoModal } from '../../../common/services/modal.service';
import { flogoIDEncode, notification } from "../../../common/utils";


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
        private router: Router,
        public translate: TranslateService,
        private flowsService: RESTAPIFlowsService,
        public applicationServiceAPI: RESTAPIApplicationsService
    ) {
    }

    ngOnInit() {
      this.loadFlows();
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
        return _.forEach(flows, (flow:any) => {
          flow.createdAt = flow.createdAt;
          delete flow.createdAt;
        });
    }

  loadFlows() {
    this.applicationServiceAPI.recentFlows()
      .then((flows: Array<any>) => {
        flows = flows.length <= 3 ? flows : flows.slice(0, 3);
        flows.forEach(flow => {
          flow.encodedId = flogoIDEncode(flow.id)
        });
        this.recent = flows;
      });

    // this.applicationServiceAPI.allFlows()
    //   .then((flows: Array<IFlogoApplicationFlowModel>) => {
    //     this.originalFlows = flows;
    //     this.flows = this.getOriginalFlows();
    //   });
  }

  onFlowSelected(flow) {
    this.router.navigate(['/flows', flogoIDEncode(flow._id)]);
  }

  onFlowDeleted(flow) {
    this.flowsService.deleteFlow(flow._id)
      .then(() => {
        let message = this.translate.instant('FLOWS:SUCCESS-MESSAGE-FLOW-DELETED');
        notification(message, 'success', 3000)
      })
      .then(() => {
        this.loadFlows();
      })
      .catch(err => {
        let message = this.translate.instant('FLOWS:ERROR-MESSAGE-REMOVE-FLOW', err);
        notification(message, 'error', 3000);
        console.error(err);
      })
  }
}
