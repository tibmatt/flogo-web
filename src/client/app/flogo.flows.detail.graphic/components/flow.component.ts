import {Component} from 'angular2/core';
//import {RouteConfig, RouterOutlet} from 'angular2/router';
import {PostService} from '../../../common/services/post.service';

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
    this._postService.publish({
      channel: "flogo.flows.detail.graphic",
      topic: "add-trigger",
      data: {
        who: "FlogoCanvasFlowComponent - add trigger"
      }
    })
  }

  selectTrigger(){
    this._postService.publish({
      channel: "flogo.flows.detail.graphic",
      topic: "select-trigger",
      data: {
        who: "FlogoCanvasFlowComponent - select trigger"
      }
    })
  }

  addTask(){
    this._postService.publish({
      channel: "flogo.flows.detail.graphic",
      topic: "add-task",
      data: {
        who: "FlogoCanvasFlowComponent - add task"
      }
    })
  }

  selectTask(){
    this._postService.publish({
      channel: "flogo.flows.detail.graphic",
      topic: "select-task",
      data: {
        who: "FlogoCanvasFlowComponent - select task"
      }
    })
  }
}
