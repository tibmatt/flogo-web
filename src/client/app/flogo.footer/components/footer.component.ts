import { Component } from '@angular/core';

@Component({
    selector : 'flogo-footer',
    moduleId : module.id,
    templateUrl : 'footer.tpl.html',
    styleUrls : [ 'footer.component.css' ]
})
export class FlogoFooterComponent {
    messages: string[];
    searchValue: string = '';
    isMaximized: boolean = false;

  constructor() {
  }

}
