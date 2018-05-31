import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { SingleEmissionSubject } from '../shared/single-emission-subject';
import { TYPE_PARAM_OUTPUT } from '../services/dragging.service';

import { MapperTreeNode } from '../models/mapper-treenode.model';
import { MapperService, MapperState, TreeState } from '../services/mapper.service';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'flogo-mapper-output-list',
  templateUrl: 'output-list.component.html',
  styleUrls: ['output-list.component.css']
})
export class OutputListComponent implements OnInit, OnDestroy {
  @Input() searchPlaceholder: string;
  @Output() selectNode = new EventEmitter<MapperTreeNode>();
  treeNodes: MapperTreeNode[];
  filterTerm: string;
  dragType = TYPE_PARAM_OUTPUT;

  private ngDestroy: SingleEmissionSubject = SingleEmissionSubject.create();

  constructor(private mapperService: MapperService) {
  }

  ngOnInit() {
    this.mapperService.state$
      .pipe(
        map((state: MapperState) => state.outputs),
        distinctUntilChanged(),
        takeUntil(this.ngDestroy),
      )
      .subscribe((outputs: TreeState) => {
        this.treeNodes = outputs.nodes;
        this.filterTerm = outputs.filterTerm;
      });
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
