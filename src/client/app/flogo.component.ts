import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd, NavigationCancel } from '@angular/router';

import { LoadingStatusService } from './core/services/loading-status.service';
import { Observable } from 'rxjs/Observable';

@Component({
  // disabling component-selector rule as the main application component name does not require it
  // tslint:disable-next-line:component-selector
  selector: 'flogo',
  templateUrl: 'flogo.component.html',
  styleUrls: ['flogo.component.less']
})

export class FlogoAppComponent implements OnInit {

  public isPageLoading: Observable<boolean>;
  public showNav = true;

  constructor(public router: Router,
              public loadingStatusService: LoadingStatusService,
              private activatedRoute: ActivatedRoute) {
    this.isPageLoading = this.loadingStatusService.status;
  }

  public ngOnInit() {

    this.router.events.subscribe((event: any): void => {
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.loadingStatusService.stop();
      }
    });

    this.activatedRoute.queryParams
      .subscribe((params: Params) => this.showNav = !params['nonav']);

  }
}
