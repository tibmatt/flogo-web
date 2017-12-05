import { Component } from '@angular/core';

@Component({
    selector : 'flogo-footer',
    // moduleId : module.id,
    templateUrl : 'footer.component.html',
    styleUrls : [ 'footer.component.less' ]
})
export class FooterComponent {
  currentYear: number;

  constructor() {
    this.currentYear = (new Date).getFullYear();
  }

}
