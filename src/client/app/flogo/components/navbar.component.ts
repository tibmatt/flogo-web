import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
  selector: 'flogo-navbar',
  templateUrl: '/app/flogo/components/navbar.tpl.html',
  styleUrls: ['app/flogo/components/navbar.component.css'],
  directives: [ROUTER_DIRECTIVES]
})

export class FlogoNavbarComponent{

}
