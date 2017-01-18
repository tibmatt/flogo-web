import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { IFlogoApplicationModel } from '../../../common/application.model';

import { FlogoModal } from '../../../common/services/modal.service';


@Component({
  selector: 'flogo-apps',
  moduleId: module.id,
  templateUrl: 'apps.tpl.html',
  styleUrls: ['apps.component.css'],
  providers: [FlogoModal]
})
export class FlogoAppsComponent {

  constructor(private _router: Router, public translate: TranslateService) {
  }

  // TODO: remove?
  onAddedApp(application: IFlogoApplicationModel) {
  }


  onSelectedApp(application: IFlogoApplicationModel) {
    this._router.navigate(['/apps', application.id]);
  }


  onDeletedApp(application: IFlogoApplicationModel) {
    this._router.navigate(['/apps']);

  }

}
