import { Component, OnDestroy, OnInit } from '@angular/core';

import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';

import { SingleEmissionSubject } from '../shared/single-emission-subject';
import { TYPE_PARAM_FUNCTION } from '../tree/dragging.service';

import { EditorService } from '../editor/editor.service';
import { MapperTreeNode } from '../models/mapper-treenode.model';
import { MapperService, MapperState, TreeState } from '../services/mapper.service';

@Component({
  selector: 'flogo-mapper-functions',
  templateUrl: 'functions.component.html',
  styleUrls: ['functions.component.css']
})
export class FunctionsComponent implements OnInit, OnDestroy {
  help: MapperTreeNode;
  name: string;
  functions: MapperTreeNode[] = [];
  filterTerm = '';
  dragType = TYPE_PARAM_FUNCTION;

  private ngDestroy: SingleEmissionSubject = SingleEmissionSubject.create();

  constructor(private mapperService: MapperService, private editorService: EditorService) {
  }

  ngOnInit() {
    this.name = '';
    this.help = null;
    this.mapperService.state
      .map((state: MapperState) => state.functions)
      .distinctUntilChanged()
      .takeUntil(this.ngDestroy)
      .subscribe((functions: TreeState) => {
        this.functions = functions.nodes;
        this.filterTerm = functions.filterTerm || '';
      });
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();
  }

  onSelect(node: MapperTreeNode) {
    const data = node.data;
    if (data && data.snippet) {
      this.editorService.insertText(data.snippet);
    }
  }

  onHover(node: MapperTreeNode) {
    if (node.data && node.data.help) {
      this.name = node.label;
      this.help = node.data.help;
    }
  }

  onSearch(searchTerm: string) {
    this.mapperService.filterFunctions(searchTerm);
  }


}
