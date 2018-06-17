import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { filter, switchMap } from 'rxjs/operators';

import { MapperTreeNode } from '../models/mapper-treenode.model';
import { MapperController} from './mapper-controller';
import { MapperState } from '@flogo/flow/shared/mapper/models/mapper-state';

@Injectable()
export class MapperService implements OnDestroy {

  state$: Observable<MapperState>;
  private controllerSrc: ReplaySubject<MapperController>;
  private controller: MapperController;

  constructor() {
    this.controllerSrc = new ReplaySubject<MapperController>(1);
    this.state$ = this.controllerSrc.pipe(
      filter(controller => !!controller),
      switchMap((controller) => controller.state$),
    );
  }

  ngOnDestroy() {
    this.controllerSrc.unsubscribe();
  }

  setController(controller: MapperController) {
    this.controller = controller;
    if (this.controller) {
      this.controllerSrc.next(this.controller);
    }
  }

  selectInput(node: MapperTreeNode) {
    if (this.controller) {
      this.controller.selectInput(node);
    }
  }

  filterInputs(filterTerm: string) {
    if (this.controller) {
      this.controller.filterInputs(filterTerm);
    }
  }

  filterOutputs(filterTerm: string) {
    if (this.controller) {
      this.controller.filterOutputs(filterTerm);
    }
  }

  filterFunctions(filterTerm: string) {
    if (this.controller) {
      this.controller.filterFunctions(filterTerm);
    }
  }

  expressionChange(nodePath: string, expression: string) {
    if (this.controller) {
      this.controller.expressionChange(nodePath, expression);
    }
  }

}
