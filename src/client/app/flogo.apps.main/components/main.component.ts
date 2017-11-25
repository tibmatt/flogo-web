import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IFlogoApplicationModel, IFlogoApplicationFlowModel } from '../../core/application.model';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { FlogoModal } from '../../core/services/modal.service';
import { AppsApiService } from '../../core/services/restapi/v2/apps-api.service';


@Component({
  selector: 'flogo-apps-main',
  // moduleId: module.id,
  templateUrl: 'main.tpl.html',
  styleUrls: ['main.component.less']
})
export class FlogoMainComponent implements OnInit {
  public recent: Array<any> = [];
  flows: Array<IFlogoApplicationFlowModel> = [];
  originalFlows: Array<IFlogoApplicationFlowModel> = [];
  application: IFlogoApplicationModel = null;

  constructor(private _flogoModal: FlogoModal,
              private router: Router,
              public translate: TranslateService,
              public applicationServiceAPI: AppsApiService) {
  }

  ngOnInit() {
    this.loadFlows();
  }

  /*onChangedSearch(search) {
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
   }*/

  loadFlows() {
    this.applicationServiceAPI.recentFlows()
      .then((flows: Array<any>) => {
        flows = flows.length <= 10 ? flows : flows.slice(0, 10);
        this.recent = flows;
      });
  }

  onSelectedApp(application: IFlogoApplicationModel) {
    this.router.navigate(['/apps', application.id]);
  }
}
