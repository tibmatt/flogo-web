import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MapperTreeNode } from '../models/mapper-treenode.model';

import { MapperService, MapperState, TreeState } from '../services/mapper.service';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';

@Component({
  selector: 'flogo-mapper-input-list',
  templateUrl: 'input-list.component.html',
  styleUrls: ['input-list.component.css']
})
export class InputListComponent implements OnInit, OnDestroy {
  @Input() searchPlaceholder: string;
  treeNodes: MapperTreeNode[];
  selectedInput: MapperTreeNode;
  filterTerm: string;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private mapperService: MapperService) {
  }

  ngOnInit() {
    const stateObserver = this.mapperService.state.share();
    stateObserver
      .map((state: MapperState) => state.inputs)
      .distinctUntilChanged()
      .takeUntil(this.ngUnsubscribe)
      .subscribe((inputs: TreeState) => {
        this.treeNodes = inputs.nodes;
        this.filterTerm = inputs.filterTerm;
      });

    stateObserver
      .map((state: MapperState) => state.currentSelection ? state.currentSelection.node : null)
      .distinctUntilChanged()
      .takeUntil(this.ngUnsubscribe)
      .subscribe((node: MapperTreeNode) => {
        this.selectedInput = node;
      });

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onInputSelect(node: MapperTreeNode) {
    this.mapperService.selectInput(node);
  }

  onInputSearch(searchTerm: string) {
    this.mapperService.filterInputs(searchTerm);
  }
}
