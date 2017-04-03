import {Component, OnInit, OnDestroy} from '@angular/core';
import { ActivatedRoute, Router, Params as RouteParams } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { flogoIDEncode, notification } from '../../../common/utils';
import { PostService } from '../../../common/services/post.service'
import { PUB_EVENTS as SUB_EVENTS } from '../../flogo.flows.add/message';
import { AppDetailService, ApplicationDetail } from '../../flogo.apps/services/apps.service';
import { FlowsService } from '../../flogo.apps/services/flows.service';

import 'rxjs/add/operator/map';

@Component({
  selector: 'flogo-app-container',
  moduleId: module.id,
  templateUrl: 'container.tpl.html',
  styleUrls: ['container.component.css']
})
export class FlogoApplicationContainerComponent implements OnInit, OnDestroy {
  public appDetail: ApplicationDetail = null;
  private subscriptions: any;

  constructor(
    public translate: TranslateService,
    private router : Router,
    private route: ActivatedRoute,
    private appService: AppDetailService,
    private flowsService: FlowsService,
    private postService: PostService
  ) {
    this.initSubscribe();
  }

  public ngOnInit() {
    this.route.params
      .map((params: RouteParams) => params['appId'])
      .subscribe((appId: string) => {
        this.appService.load(appId);
      });

    this.appService.currentApp()
      .subscribe((appDetail: ApplicationDetail) => {
        if (!appDetail) {
          // not initialized yet
          this.appDetail = null;
          return;
        } else if (!appDetail.app) {
          // no app anymore, good bye
          this.router.navigate(['/']);
          return;
        }
        this.appDetail = _.cloneDeep(appDetail);
      });
  }

  public ngOnDestroy() {
    // cancel subscriptions
    _.each(this.subscriptions, sub => {
        this.postService.unsubscribe(sub);
      }
    );
  }

  public onFlowSelected(flow) {
    this.router.navigate(['/flows', flow.id]);
  }

  public onFlowAdded(event) {
    this.appService.reload();
  }

  public onFlowDeleted(flow){
    this.flowsService.deleteFlow(flow.id).then(()=>{
      this.appService.reload();
    });
  }

  private initSubscribe() {
    this.subscriptions = [
      this.postService.subscribe(_.assign({}, SUB_EVENTS.addFlow, { callback: this.onAddFlow.bind(this) }))
    ]
  }

  private onAddFlow(data: any) {
    const appId = this.appDetail.app.id;
    const triggerId = data.triggerId;
    this.flowsService.createFlow(appId, {
      name: data.name,
      description: data.description,
    }, triggerId).then(() => {
      let message = this.translate.instant('FLOWS:SUCCESS-MESSAGE-FLOW-CREATED');
      notification(message, 'success', 3000);
    })
      .then(() => this.appService.reload())
      .catch((err) => {
        let message = this.translate.instant('FLOWS:CREATE_FLOW_ERROR', err);
        notification(message, 'error');
        console.error(err);
      });
  }

}
