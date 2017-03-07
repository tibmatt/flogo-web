import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd, NavigationCancel } from '@angular/router';

import { LoadingStatusService } from '../../../common/services/loading-status.service';
import { LanguageService } from '../../../common/services/language.service';
import { Observable } from 'rxjs/Observable';

//todo:remove
import 'rxjs/add/operator/do';


@Component({
  selector: 'flogo-app',
  moduleId: module.id,
  templateUrl: 'flogo.tpl.html',
  styleUrls: ['flogo.component.css']
})

export class FlogoAppComponent implements OnInit {

  public isPageLoading: Observable<boolean>;
  public showNav: boolean = true;

  constructor(public router: Router,
              public loadingStatusService: LoadingStatusService,
              public languageService: LanguageService,
              private activatedRoute: ActivatedRoute,
  ) {

    this.isPageLoading = this.loadingStatusService.status;
    this.languageService.configureLanguage();
  }

  public ngOnInit() {

    this.router.events.subscribe((event: any): void => {
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.loadingStatusService.stop();
      }
    });

    this.activatedRoute.queryParams
      .do(params => console.log('params', params))
      .subscribe((params: Params) => this.showNav = !params['nonav']);

  }



}
