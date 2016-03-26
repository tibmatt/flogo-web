import {Component} from 'angular2/core';
import {PostService} from '../../../common/services/post.service';

@Component({
  selector: 'flogo-flows-detail-triggers',
  moduleId: module.id,
  templateUrl: 'triggers.tpl.html',
  styleUrls: ['triggers.component.css']
})

export class FlogoFlowsDetailTriggers{
  constructor(private _postService: PostService){
    this.initSubscribe();
  }

  private initSubscribe(){

  }
}
