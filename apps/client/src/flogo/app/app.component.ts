import { cloneDeep } from 'lodash';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Params as RouteParams } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApplicationDetail, AppDetailService } from './core';

import { AppResourceService } from '@flogo-web/client-core/services';
import { NotificationsService } from '@flogo-web/client-core/notifications';
import { DeleteEvent } from '@flogo-web/client/app/resource-views';

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
    private appService: AppDetailService
  ) {}

  public ngOnInit() {
    this.route.params
      .pipe(map((params: RouteParams) => params['appId']))
      .subscribe((appId: string) => {
        this.appService.load(appId);
      });

    this.appObserverSubscription = this.appService
      .currentApp()
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
    // TODO: make resource type dynamic instead of hardcoding 'flow'
    this.router.navigate(['/resources', flow.id, 'flow']);
  }
}
