import {Component} from 'angular2/core';
//import {RouteConfig, RouterOutlet} from 'angular2/router';
import {PostService} from '../../../common/services/post.service';
import {PUB_EVENTS} from '../messages';

@Component({
  selector: 'flogo-canvas-flow',
  moduleId: module.id,
  templateUrl: 'flow.tpl.html'
})

//@RouteConfig([
//  {path:'/',    name: 'FlogoCanvas',   component: FlogoCanvas}
//])

export class FlogoCanvasFlowComponent {
  constructor(private _postService:PostService) {
  }

  addTrigger(){
    var publish = _.assign({}, PUB_EVENTS.addTrigger, {data: {who: "FlogoCanvasFlowComponent - add trigger"} });
    this._postService.publish(publish);
  }

  selectTrigger(){
    var publish = _.assign({}, PUB_EVENTS.selectTrigger, {data: {who: "FlogoCanvasFlowComponent - select trigger"} });
    this._postService.publish(publish);
  }

  addTask(){
    var publish = _.assign({}, PUB_EVENTS.addTask, {data: {who: "FlogoCanvasFlowComponent - add task"} });
    this._postService.publish(publish);
  }

  selectTask(){
    var publish = _.assign({}, PUB_EVENTS.selectTask, {data: {who: "FlogoCanvasFlowComponent - select task"} });
    this._postService.publish(publish);
  }
}
