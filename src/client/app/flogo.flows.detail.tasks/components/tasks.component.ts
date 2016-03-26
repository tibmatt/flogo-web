import {Component} from 'angular2/core';
import {PostService} from '../../../common/services/post.service';

@Component({
  selector: 'flogo-flows-detail-tasks',
  moduleId: module.id,
  templateUrl: 'tasks.tpl.html',
  styleUrls: ['tasks.component.css']
})

export class FlogoFlowsDetailTasks{
  constructor(private _postService: PostService){
    this.initSubscribe();
  }

  private initSubscribe(){

  }
}
