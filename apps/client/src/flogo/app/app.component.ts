import { cloneDeep } from 'lodash';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Params as RouteParams } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApplicationDetail, AppDetailService } from './core';

import { FlowsService } from '../core/services/flows.service';
import { NotificationsService } from '@flogo-web/client/core/notifications';

@Component({
  selector: 'flogo-app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.less'],
})
export class FlogoApplicationComponent implements OnInit, OnDestroy {
  public appDetail: ApplicationDetail = null;
  private appObserverSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appService: AppDetailService,
    private flowsService: FlowsService,
    private notificationsService: NotificationsService
  ) {}

  public ngOnInit() {
    this.route.params.pipe(map((params: RouteParams) => params['appId'])).subscribe((appId: string) => {
      this.appService.load(appId);
    });

    this.appObserverSubscription = this.appService.currentApp().subscribe((appDetail: ApplicationDetail) => {
      if (!appDetail) {
        // not initialized yet
        this.appDetail = null;
        return;
      } else if (!appDetail.app) {
        // no app anymore, good bye
        this.router.navigate(['/']);
        return;
      }
      this.appDetail = cloneDeep(appDetail);
    });
  }

  public ngOnDestroy() {
    // Unsubscribe the subscription on currentApp's observable object created in this instance of container component
    this.appObserverSubscription.unsubscribe();
    // Reset currentApp$ next element to null
    this.appService.resetApp();
  }

  public onFlowSelected(flow) {
    this.router.navigate(['/flows', flow.id]);
  }

  public onFlowDeleted(eventData) {
    this.flowsService.deleteFlowWithTrigger(eventData.flow.id, eventData.triggerId).then(() => {
      this.appService.reload();
    });
  }

  public onFlowAdded({ triggerId, name, description }: { triggerId?: string; name: string; description?: string }) {
    const appId = this.appDetail.app.id;
    const profileType = this.appDetail.app.profileType;
    this.flowsService
      .createFlow(appId, { name, description: description }, triggerId, profileType)
      .then(() => this.notificationsService.success({ key: 'FLOWS:SUCCESS-MESSAGE-FLOW-CREATED' }))
      .then(() => this.appService.reload())
      .catch(err => {
        console.error(err);
        this.notificationsService.error({ key: 'FLOWS:CREATE_FLOW_ERROR', params: err });
      });
  }
}
