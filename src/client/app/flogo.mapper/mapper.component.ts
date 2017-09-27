import { Component, EventEmitter, Input, OnDestroy, OnChanges, OnInit, Output, SimpleChange } from '@angular/core';
import { IMapperContext, IMapping } from './models/map-model';

import 'rxjs/add/operator/auditTime';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/skipWhile';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/withLatestFrom';

import { SingleEmissionSubject } from './shared/single-emission-subject';

import { CurrentSelection, MapperService, MapperState } from './services/mapper.service';
import { EditorService } from './editor/editor.service';
import { DraggingService, TYPE_PARAM_FUNCTION, TYPE_PARAM_OUTPUT } from './tree/dragging.service';

@Component({
  selector: 'flogo-mapper',
  templateUrl: 'mapper.component.html',
  styleUrls: ['mapper.component.css'],
  providers: [MapperService, EditorService, DraggingService]
})
export class MapperComponent implements OnInit, OnChanges, OnDestroy {
  @Input() context: IMapperContext;
  @Output() mappingsChange = new EventEmitter<IMapping>();
  currentInput: CurrentSelection = null;
  isDraggingOver = false;

  private dragOverEditor = new EventEmitter<Event>();
  private ngDestroy: SingleEmissionSubject = SingleEmissionSubject.create();

  constructor(private mapperService: MapperService,
              private editorService: EditorService,
              private draggingService: DraggingService) {
  }

  ngOnInit() {
    const state$ = this.mapperService.state
      .catch(err => {
        console.error(err);
        throw err;
      })
      .share();

    state$.map((state: MapperState) => state.currentSelection)
      .distinctUntilChanged()
      .takeUntil(this.ngDestroy)
      .subscribe((currentSelection: CurrentSelection) => {
        this.currentInput = currentSelection;
        if (this.currentInput) {
          this.editorService.changeContext(this.currentInput.expression);
        }
      });

    state$.map((state: MapperState) => state.currentSelection ? state.currentSelection.errors : null)
      .distinctUntilChanged()
      .takeUntil(this.ngDestroy)
      .subscribe((errors: any[]) => {
        if (this.currentInput) {
          this.editorService.validated(errors);
        }
      });

    state$
      .scan((acc, state: MapperState) => {
        let nodeChanged = false;
        let prevNode = acc.prevNode;
        const currentSelection = state.currentSelection || {};
        if (currentSelection.node && currentSelection.node !== acc.prevNode) {
          nodeChanged = true;
          prevNode = currentSelection.node;
        }
        return { state, prevNode, nodeChanged };
      }, { state: null, prevNode: null, nodeChanged: false })
      .skipWhile(({ state, nodeChanged }) =>
        nodeChanged || !state || !state.currentSelection || !state.currentSelection.node
      )
      .map(({ state }) => (<MapperState>state).currentSelection.expression)
      .distinctUntilChanged()
      .withLatestFrom(state$, (expr, state) => state)
      .map((state: MapperState) => ({
        mappings: <any>state.mappings,
        getMappings() {
          return this.mappings;
        }
      }))
      .takeUntil(this.ngDestroy)
      .do(mappings => {
        // console.log("@Output mappings:", mappings);
      })
      .subscribe(this.mappingsChange);

    this.editorService.outputExpression$
      .takeUntil(this.ngDestroy)
      .subscribe(expression => this.mapperService.expressionChange(expression));

    this.dragOverEditor
      .debounceTime(300)
      .map((ev: DragEvent) => ({ x: ev.clientX, y: ev.clientY }))
      .distinctUntilChanged((prev, next) => prev.x === next.x && prev.y === next.y)
      .subscribe(position => this.editorService.dragOver(position));

    this.mapperService.setContext(this.context);
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes['context']) {
      this.ngOnInit();
    }
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();
  }

  onDrop(event: DragEvent) {
    if (this.isDragAcceptable()) {
      const dataTransfer = event.dataTransfer.getData('data');
      const node = this.draggingService.getData();
      const type = this.draggingService.getType();
      let text = '';
      const position = { x: event.clientX, y: event.clientY };
      if (type === TYPE_PARAM_OUTPUT) {
        text = node.snippet;
      } else if (type === TYPE_PARAM_FUNCTION && node.data) {
        text = node.data.snippet;
      }
      this.editorService.insertText(text, position);
      this.onDragLeave();
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onDragOver(event: DragEvent) {
    if (this.isDragAcceptable()) {
      this.dragOverEditor.emit(event);
      event.dataTransfer.dropEffect = 'copy';
      event.preventDefault();
    }
  }

  onOutputSelected(node: any) {
    this.editorService.insertText(node.snippet);
  }

  onDragEnter(event: DragEvent) {
    this.isDraggingOver = true;
  }

  onDragLeave(event?: DragEvent) {
    this.isDraggingOver = false;
  }

  onClickOutside() {
    if (this.currentInput) {
      this.mapperService.selectInput(null);
    }
  }

  private isDragAcceptable() {
    return this.draggingService.accepts(TYPE_PARAM_OUTPUT)
      || this.draggingService.accepts(TYPE_PARAM_FUNCTION);
  }

}
