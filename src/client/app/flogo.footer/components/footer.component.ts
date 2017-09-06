import { Component } from '@angular/core';

@Component({
    selector : 'flogo-footer',
    // moduleId : module.id,
    templateUrl : 'footer.tpl.html',
    styleUrls : [ 'footer.component.less' ]
})
export class FlogoFooterComponent {
  currentYear: number;

  constructor() {
    this.currentYear = (new Date).getFullYear();
  }

}
