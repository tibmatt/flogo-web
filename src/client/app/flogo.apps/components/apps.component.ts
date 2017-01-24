import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IFlogoApplicationModel } from '../../../common/application.model';

import { FlogoModal } from '../../../common/services/modal.service';
import { AppDetailService } from '../services/apps.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';


@Component({
  selector: 'flogo-apps',
  moduleId: module.id,
  templateUrl: 'apps.tpl.html',
  styleUrls: ['apps.component.css'],
  providers: [FlogoModal]
})
export class FlogoAppsComponent implements OnInit {

  currentApplication : IFlogoApplicationModel;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private appService: AppDetailService) {
  }

  // TODO: remove?
  onAddedApp(application: IFlogoApplicationModel) {
  }

  ngOnInit() {
    this.router.events.
      filter(event => event instanceof NavigationEnd)
      .subscribe(() => {
        const isMainView = !this.route.firstChild.snapshot.params['appId'];
        if (isMainView) {
          this.currentApplication = null;
        }
      });

    this.appService.currentApp()
      .filter(appDetail => !!(appDetail && appDetail.app))
      .map(appDetail => appDetail.app)
      .subscribe(app => {
        this.currentApplication = app;
      });
  }


  onSelectedApp(application: IFlogoApplicationModel) {
    this.router.navigate(['/apps', application.id]);
  }


  onDeletedApp(deletedApplication: IFlogoApplicationModel) {
    if (this.currentApplication && this.currentApplication.id == deletedApplication.id) {
      this.router.navigate(['/apps']);
    }
  }

}
