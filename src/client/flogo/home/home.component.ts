import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App, FlowSummary } from '@flogo/core';
import { AppsApiService } from '../core/services/restapi/v2/apps-api.service';

@Component({
  selector: 'flogo-home',
  // moduleId: module.id,
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.less']
})
export class FlogoHomeComponent implements OnInit {
  public recent: Array<any> = [];
  flows: Array<FlowSummary> = [];
  originalFlows: Array<FlowSummary> = [];
  application: App = null;

  constructor(private router: Router,
              public applicationServiceAPI: AppsApiService) {
  }

  ngOnInit() {
    this.loadFlows();
  }

  /*onChangedSearch(search) {
   let flows = this.originalFlows || [];

   if(search && flows.length){
   let filtered =  flows.filter((flow:FlowSummary)=> {
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

  onSelectedApp(application: App) {
    this.router.navigate(['/apps', application.id]);
  }
}
