import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { SingleEmissionSubject } from '../shared/single-emission-subject';
import { TYPE_PARAM_OUTPUT } from '../services/dragging.service';

import { MapperTreeNode } from '../models/mapper-treenode.model';
import { MapperService, MapperState, TreeState } from '../services/mapper.service';
import { distinctUntilChanged, map, shareReplay, takeUntil } from 'rxjs/operators';
import { selectedInputKey, selectFilterFromOutputs, selectNodesFromOutputs } from '@flogo/flow/shared/mapper/services/selectors';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'flogo-mapper-output-list',
  templateUrl: 'output-list.component.html',
  styleUrls: ['output-list.component.css']
})
export class OutputListComponent implements OnInit, OnDestroy {
  @Input() searchPlaceholder: string;
  @Output() selectNode = new EventEmitter<MapperTreeNode>();
  treeNodes$: Observable<MapperTreeNode[]>;
  filterTerm$: Observable<string>;
  dragType = TYPE_PARAM_OUTPUT;

  private ngDestroy: SingleEmissionSubject = SingleEmissionSubject.create();

  constructor(private mapperService: MapperService) {
  }

  ngOnInit() {
    const state$ = this.mapperService.state$.pipe(shareReplay());
    this.treeNodes$ = state$.pipe(selectNodesFromOutputs);
    this.filterTerm$ = state$.pipe(selectFilterFromOutputs);
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();
  }

  onOutputSelect(node: MapperTreeNode) {
    this.selectNode.emit(node);
  }

  onSearchChange(searchTerm: string) {
    this.mapperService.filterOutputs(searchTerm);
  }

}
