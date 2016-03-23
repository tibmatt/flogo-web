import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {FlogoNavbarComponent} from './navbar.component';
import {FlogoFlowsComponet} from '../../flogo.flows/components/flows.component';
import {FlogoCanvasComponent} from '../../flogo.canvas/components/canvas.component';

@Component({
  selector: 'flogo-app',
  templateUrl: '/app/flogo/components/flogo.tpl.html',
  directives: [ROUTER_DIRECTIVES, FlogoNavbarComponent]
})

@RouteConfig([
  {
    path: '/', name: "FlogoHome", component:FlogoFlowsComponet
  },
  {
    path:'/flows', name:"FlogoFlowDetail", component: FlogoCanvasComponent
  }
])

export class FlogoAppComponent{

}
