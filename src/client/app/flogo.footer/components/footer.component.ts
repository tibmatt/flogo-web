import { Component } from '@angular/core';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';
import { PostService } from '../../../common/services/post.service';
import { LogService } from '../../../common/services/log.service';

@Component(
  {
    selector : 'flogo-footer',
    moduleId : module.id,
    directives: [],
    templateUrl : 'footer.tpl.html',
    pipes: [TranslatePipe],
    styleUrls : [ 'footer.component.css' ]
  }
)
export class FlogoFooter {
    messages: string[];
    searchValue: string = '';
    isMaximized: boolean = false;

  constructor( public translate: TranslateService ) {
  }

}
