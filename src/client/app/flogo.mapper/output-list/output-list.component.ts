import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import { SingleEmissionSubject } from '../shared/single-emission-subject';
import { TYPE_PARAM_OUTPUT } from '../tree/dragging.service';

import { MapperTreeNode } from '../models/mapper-treenode.model';
import { MapperService, MapperState, TreeState } from '../services/mapper.service';

import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';

@Component({
  selector: 'flogo-mapper-output-list',
  templateUrl: 'output-list.component.html',
  styleUrls: ['output-list.component.css']
})
export class OutputListComponent implements OnInit, OnDestroy {
  treeNodes: MapperTreeNode[];
  filterTerm: string;
  dragType = TYPE_PARAM_OUTPUT;
  @Output() selectNode = new EventEmitter<MapperTreeNode>();

  private ngDestroy: SingleEmissionSubject = SingleEmissionSubject.create();

  constructor(private mapperService: MapperService) {
  }

  ngOnInit() {
    this.mapperService.state
      .map((state: MapperState) => state.outputs)
      .distinctUntilChanged()
      // .do(ins => console.log("outputs changed", ins))
      .takeUntil(this.ngDestroy)
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
