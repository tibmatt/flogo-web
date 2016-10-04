import {Component} from '@angular/core';
import {Router, NavigationEnd, NavigationCancel} from '@angular/router';
import {LoadingStatusService} from '../../../common/services/loading-status.service';

import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'flogo-app',
  moduleId: module.id,
  templateUrl: 'flogo.tpl.html',
  styleUrls: [ 'flogo.component.css' ]
})

export class FlogoAppComponent{

  public isPageLoading : Observable<boolean>;

  constructor(private router : Router, private loadingStatusService : LoadingStatusService){
    this.isPageLoading = this.loadingStatusService.status;

    this.router.events.subscribe((event:any):void => {
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.loadingStatusService.stop();
      }
    });

  }
}
