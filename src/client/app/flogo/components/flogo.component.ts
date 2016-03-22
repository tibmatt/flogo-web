import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {FlogoNavbarComponent} from './navbar.component';
import {FlogoTwoColumnComponent} from './two-column.component';

@Component({
  selector: 'flogo-app',
  moduleId: module.id,
  templateUrl: './flogo.tpl.html',
  directives: [ROUTER_DIRECTIVES, FlogoNavbarComponent]
})

@RouteConfig([
  {
    path: '/', name: "FlogoHome", component:FlogoTwoColumnComponent
  }
])

export class FlogoAppComponent{

}
