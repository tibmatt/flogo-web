import {Component} from 'angular2/core';
import {PostService} from '../../../common/services/post.service';

@Component({
  selector: 'flogo-flows-detail-tasks-detail',
  moduleId: module.id,
  templateUrl: 'detail.tpl.html',
  styleUrls: ['detail.component.css']
})

export class FlogoFlowsDetailTasksDetail{
  constructor(private _postService: PostService){
    this.initSubscribe();
  }

  private initSubscribe(){

  }
}
