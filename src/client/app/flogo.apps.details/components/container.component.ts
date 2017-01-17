import {Component, OnInit, OnDestroy} from '@angular/core';
import { ActivatedRoute, Router, Params as RouteParams } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { flogoIDEncode, notification } from '../../../common/utils';
import { IFlogoApplicationModel } from '../../../common/application.model';
import { RESTAPIApplicationsService } from '../../../common/services/restapi/applications-api.service';
import { RESTAPIFlowsService } from '../../../common/services/restapi/flows-api.service';
import { PostService } from '../../../common/services/post.service'
import { PUB_EVENTS as SUB_EVENTS } from '../../flogo.flows.add/message';

import 'rxjs/add/operator/map';

@Component({
  selector: 'flogo-app-container',
  moduleId: module.id,
  templateUrl: 'container.tpl.html',
  styleUrls: []
})
export class FlogoApplicationContainerComponent implements OnInit, OnDestroy {
  public application: IFlogoApplicationModel = null;
  private subscriptions: any;

  constructor(
    public translate: TranslateService,
    private router : Router,
    private route: ActivatedRoute,
    private apiApplications: RESTAPIApplicationsService,
    private flowsService: RESTAPIFlowsService,
    private postService: PostService
  ) {
    this.initSubscribe();
  }

  public ngOnInit() {
    this.route.params
      .map((params: RouteParams) => params['id'])
      .subscribe((appId: string) => {
        this.loadApp(appId);
      });
  }

  public ngOnDestroy() {
    // cancel subscribtions
    _.each(this.subscriptions, sub => {
        this.postService.unsubscribe(sub);
      }
    );
  }

  public onFlowSelected(flow) {
    console.log('onFlowSelected', flow);
    this.router.navigate(['/flows', flogoIDEncode(flow.id)]);
  }

  public onFlowAdded(event) {
    this.loadApp(this.application.id);
  }

  private initSubscribe() {
    this.subscriptions = [
      this.postService.subscribe(_.assign({}, SUB_EVENTS.addFlow, { callback: this.onAddFlow.bind(this) }))
    ]
  }

  private onAddFlow(data: any) {
    let request = {
      name: data.name,
      description: data.description,
      appId: this.application.id,
      paths: {},
      items: {}
    };
    this.flowsService.createFlow(_.clone(request)).then((response) => {
      let message = this.translate.instant('FLOWS:SUCCESS-MESSAGE-FLOW-CREATED');
      notification(message, 'success', 3000);
    })
      .then(() => this.loadApp(this.application.id))
      .catch((err) => {
        let message = this.translate.instant('FLOWS:CREATE_FLOW_ERROR', err);
        notification(message, 'error');
        console.error(err);
      });
  }

  private loadApp(appId) {
    this.apiApplications.getApp(appId)
      .then((application: IFlogoApplicationModel) => {
        this.application = application;
      })
  }

}
