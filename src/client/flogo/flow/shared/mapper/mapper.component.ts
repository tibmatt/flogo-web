import { Component, EventEmitter, Input, OnDestroy, OnChanges, OnInit, Output, SimpleChange } from '@angular/core';
import { IMapping } from './models/imapping';
import { IMapperContext } from './models/imapper-context';

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
import { TYPE_ATTR_ASSIGNMENT, TYPE_OBJECT_TEMPLATE } from './constants';

@Component({
  selector: 'flogo-mapper',
  templateUrl: 'mapper.component.html',
  styleUrls: ['mapper.component.less'],
  providers: [MapperService, EditorService, DraggingService]
})
export class MapperComponent implements OnInit, OnChanges, OnDestroy {
  @Input() context: IMapperContext;
  @Input() inputsSearchPlaceHolder = 'Search';
  @Input() outputsSearchPlaceHolder = 'Search';
  @Output() mappingsChange = new EventEmitter<IMapping>();
  currentInput: CurrentSelection = null;
  isDraggingOver = false;
  currentMappingType: number;
  isObjectModeAllowed = false;
  displayIterators = false;
  displayMapInputs = true;
  iteratorModeOn = false;

  private dragOverEditor = new EventEmitter<Event>();
  private ngDestroy: SingleEmissionSubject = SingleEmissionSubject.create();
  private contextInUse: IMapperContext;

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

    state$
      .distinctUntilKeyChanged('currentSelection')
      // .map((state: MapperState) => state.currentSelection)
      // .distinctUntilChanged()
      .takeUntil(this.ngDestroy)
      .subscribe((state: MapperState) => {
        this.currentInput = state.currentSelection;
        if (this.currentInput) {
          const editingExpression = this.currentInput.editingExpression;
          this.currentMappingType = editingExpression.mappingType || TYPE_ATTR_ASSIGNMENT;
          const nodeDataType = this.currentInput.node.dataType;
          this.isObjectModeAllowed = nodeDataType === 'object' || nodeDataType === 'complex_object';
          const mode = editingExpression.mappingType === TYPE_OBJECT_TEMPLATE ? 'json' : null;
          this.editorService.changeContext(editingExpression.expression, mode);
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
      .scan((acc: { state: MapperState, prevNode, nodeChanged }, state: MapperState) => {
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
      .map(({ state }) => (<MapperState>state).currentSelection.editingExpression)
      .distinctUntilChanged()
      .withLatestFrom(state$, (expr, state) => state)
      .map((state: MapperState) => ({
        mappings: <any>state.mappings,
        getMappings() {
          return this.mappings;
        }
      }))
      .takeUntil(this.ngDestroy)
      // .do(mappings => {
      //   console.log("@Output mappings:", mappings);
      // })
      .subscribe(this.mappingsChange);

    this.editorService.outputExpression$
      .takeUntil(this.ngDestroy)
      .subscribe(expression => this.mapperService.expressionChange({ expression, mappingType: this.currentMappingType }));

    this.dragOverEditor
      .debounceTime(300)
      .map((ev: DragEvent) => ({ x: ev.clientX, y: ev.clientY }))
      .distinctUntilChanged((prev, next) => prev.x === next.x && prev.y === next.y)
      .subscribe(position => this.editorService.dragOver(position));

    this.initContext();

  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    const contextChange = changes['context'];
    if (!contextChange || contextChange.currentValue === this.contextInUse) {
      return;
    }
    this.contextInUse = this.context;
    if (!contextChange.isFirstChange()) {
      this.initContext();
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

  showIterators() {
    this.displayIterators = true;
    this.displayMapInputs = false;
  }

  showMapInputs() {
    this.displayMapInputs = true;
    this.displayIterators = false;
  }

  changeIteratorMode(event) {
    if (event.target.checked) {
      this.iteratorModeOn = true;
    } else {
      this.iteratorModeOn = false;
    }
  }

  toggleMode(event) {
    // todo: investigate why this callback is called twice even when the emitter emits only once
    event.stopPropagation();
    const { expression } = this.currentInput.editingExpression;
    this.currentMappingType = this.currentMappingType === TYPE_ATTR_ASSIGNMENT ? TYPE_OBJECT_TEMPLATE : TYPE_ATTR_ASSIGNMENT;
    const mode = this.getModeFor(this.currentMappingType);
    this.editorService.changeContext(expression, mode);
    this.mapperService.expressionChange({ expression, mappingType: this.currentMappingType });
  }

  onClickOutside() {
    if (this.currentInput) {
      this.mapperService.selectInput(null);
    }
  }

  get isObjectLiteralMode() {
    return this.currentMappingType === TYPE_OBJECT_TEMPLATE;
  }

  private isDragAcceptable() {
    return this.draggingService.accepts(TYPE_PARAM_OUTPUT)
      || this.draggingService.accepts(TYPE_PARAM_FUNCTION);
  }

  private initContext() {
    this.mapperService.setContext(this.contextInUse);

    this.mapperService.state
      .distinctUntilKeyChanged('context')
      .first()
      .subscribe((state: MapperState) => {
        const inputsData = state.inputs;
        // open first input by default
        if (inputsData.nodes && inputsData.nodes[0]) {
          this.mapperService.selectInput(inputsData.nodes[0]);
        }
      });
  }

  private getModeFor(mappingType: number) {
    return mappingType === TYPE_OBJECT_TEMPLATE ? 'json' : null;
  }

}
