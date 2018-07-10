import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd, NavigationCancel, NavigationStart, RouterEvent } from '@angular/router';

@Component({
  // disabling component-selector rule as the main application component name does not require it
  // tslint:disable-next-line:component-selector
  selector: 'flogo',
  templateUrl: 'flogo.component.html',
  styleUrls: ['flogo.component.less']
})

export class FlogoAppComponent implements OnInit {

  public isPageLoading: boolean;
  public showNav = true;

  constructor(public router: Router, private activatedRoute: ActivatedRoute) {
    this.isPageLoading = true;
  }

  public ngOnInit() {
    this.router.events.subscribe((event: RouterEvent): void => {
      if (event instanceof NavigationStart) {
        this.isPageLoading = true;
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.isPageLoading = false;
      }
    });

    this.activatedRoute.queryParams
      .subscribe((params: Params) => this.showNav = !params['nonav']);

  }
}
