import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { MapperService, MapperState, TreeState } from '../services/mapper.service';
import { MapperTreeNode } from '../models/mapper-treenode.model';
import { distinctUntilChanged, map, share, takeUntil } from 'rxjs/operators';

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
    const stateObserver = this.mapperService.state.pipe(share());
    stateObserver
      .pipe(
        map((state: MapperState) => state.inputs),
        distinctUntilChanged(),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe((inputs: TreeState) => {
        this.treeNodes = inputs.nodes;
        this.filterTerm = inputs.filterTerm;
      });

    stateObserver
      .pipe(
        map((state: MapperState) => state.currentSelection ? state.currentSelection.node : null),
        distinctUntilChanged(),
        takeUntil(this.ngUnsubscribe),
      )
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
