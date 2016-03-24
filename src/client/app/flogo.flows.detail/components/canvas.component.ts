import {Component} from 'angular2/core';
import {RouteConfig, RouterOutlet} from 'angular2/router';
import {FlogoCanvasFlowComponent} from '../../flogo.flows.detail.graphic/components/flow.component';

@Component({
  selector: 'flogo-canvas',
  moduleId: module.id,
  directives: [RouterOutlet, FlogoCanvasFlowComponent],
  templateUrl: 'canvas.tpl.html',
  styleUrls: ['canvas.component.css']
})

//@RouteConfig([
//  {path:'/add',    name: 'FlogoCanvas',   component: FlogoCanvas}
//])

export class FlogoCanvasComponent{

}
