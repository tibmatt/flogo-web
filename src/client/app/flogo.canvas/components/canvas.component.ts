import {Component} from 'angular2/core';
import {RouteConfig, RouterOutlet} from 'angular2/router';
import {FlogoCanvasFlowComponent} from '../../flogo.canvas.flow/components/flow.component';

@Component({
  selector: 'flogo-canvas',
  directives: [RouterOutlet],
  templateUrl: '/app/flogo.canvas/components/canvas.tpl.html',
  styleUrls: ['app/flogo.canvas/components/canvas.component.css']
})

//@RouteConfig([
//  {path:'/add',    name: 'FlogoCanvas',   component: FlogoCanvas}
//])

export class FlogoCanvasComponent{

}
