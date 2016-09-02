import { Component } from '@angular/core';
import { FlogoCanvasComponent } from '../flogo.flows.detail/components/canvas.component';
import { ROUTER_DIRECTIVES,  RouteParams,  RouterOutlet,  Router } from '@angular/router-deprecated';


@Component({
   selector: 'flogo-canvas-set',
   moduleId: module.id,
   templateUrl: 'flogo.canvas-set.tpl.html',
   directives: [ROUTER_DIRECTIVES]
})

export class FlogoCanvasSetComponent {
   private id: string;

   constructor(private _routerParams: RouteParams) {
      this.id = this._routerParams.params['id'] || "hola";
   }
}



