import { Component, Input, OnInit } from '@angular/core';

import { MapperService, MapperState } from '../services/mapper.service';
import { MapperTreeNode } from '../models/mapper-treenode.model';
import { combineLatest, distinctUntilChanged, map, pluck, shareReplay, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'flogo-mapper-input-list',
  templateUrl: 'input-list.component.html',
  styleUrls: ['input-list.component.css']
})
export class InputListComponent implements OnInit {
  @Input() searchPlaceholder: string;
  filteredNodes$: Observable<MapperTreeNode[]>;
  selectedInput$: Observable<MapperTreeNode>;
  filterTerm$: Observable<string>;

  constructor(private mapperService: MapperService) {
  }

  ngOnInit() {
    const mapperState$ = this.mapperService.state$.pipe(shareReplay());

    const inputs$: Observable<MapperState['inputs']> = mapperState$
      .pipe(
        map((state: MapperState) => state.inputs),
        distinctUntilChanged(),
        shareReplay(),
      );

    this.filterTerm$ = inputs$
      .pipe(
        map((inputs: MapperState['inputs']) => inputs.filterTerm),
        distinctUntilChanged(),
      );

    this.filteredNodes$ = inputs$
      .pipe(
        pluck('nodes'),
        distinctUntilChanged(),
        combineLatest(this.filterTerm$, (inputs: MapperState['inputs']['nodes'], filterTerm: string) => {
          if (!filterTerm || !filterTerm.trim()) {
            return inputs;
          }
          filterTerm = filterTerm.trim().toLowerCase();
          return inputs.filter(inputNode => inputNode.label.toLowerCase().includes(filterTerm));
        }),
      );

    this.selectedInput$ = mapperState$
      .pipe(
        map((state: MapperState) => state.currentSelection ? state.currentSelection.node : null),
        distinctUntilChanged(),
      );
  }

  onInputSelect(node: MapperTreeNode) {
    this.mapperService.selectInput(node);
  }

  onInputSearch(searchTerm: string) {
    this.mapperService.filterInputs(searchTerm);
  }
}
