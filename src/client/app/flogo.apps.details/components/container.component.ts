import { Component, Output, OnInit, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params as RouteParams } from '@angular/router';
import { IFlogoApplicationModel} from '../../../common/application.model';
import { RESTAPIApplicationsService } from '../../../common/services/restapi/applications-api.service';

import 'rxjs/add/operator/switch';
import 'rxjs/add/operator/map';

@Component({
    selector: 'flogo-app-container',
    moduleId: module.id,
    templateUrl: 'container.tpl.html',
    styleUrls: []
})
export class FlogoApplicationContainerComponent implements  OnInit {
    @Output() onParamChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
    public application: IFlogoApplicationModel = null;

    constructor(
        private route: ActivatedRoute,
        private apiApplications: RESTAPIApplicationsService
    ) {
    }

    ngOnInit() {

      this.route.params
      .map((params: RouteParams) =>  params['id'] )
      .subscribe((appId:string) => {
        this.apiApplications.getApp(appId)
          .then((application: IFlogoApplicationModel) => {
            this.application = application;
          })
          .then(()=> {
              this.onParamChanged.emit(true);
            })
      });
    }


}
