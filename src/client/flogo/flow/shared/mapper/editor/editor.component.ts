import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  shareReplay,
  switchMap,
  takeUntil, filter, map
} from 'rxjs/operators';

import { MonacoEditorComponent, DEFAULT_EDITOR_OPTIONS } from '../../monaco-editor';
import { SingleEmissionSubject } from '../shared/single-emission-subject';

import { MapperService } from '../services/mapper.service';
import { EditorService, InsertEvent } from './editor.service';
import { selectCurrentEditingExpression, selectedInputKey } from '../services/selectors';

@Component({
  selector: 'flogo-mapper-editor',
  template: `
    <div class="hints-overlay" *ngIf="displayHints$ | async">
      <button *ngFor="let hint of hints"
        class="hints-overlay__hint"
        (click)="hintSelected(hint)">{{ hint.label }}</button>
    </div>
    <monaco-editor class="editor"></monaco-editor>
  `,
  styleUrls: ['editor.component.less'],
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild(MonacoEditorComponent) editor: MonacoEditorComponent;
  expression = '';
  displayHints$: Observable<boolean>;

  hints = [
    {
      label: 'GET',
      value: '"GET"'
    },
    {
      label: 'POST',
      value: '"POST"'
    },
    {
      label: 'PUT',
      value: '"PUT"'
    },
    {
      label: 'PATCH',
      value: '"PATCH"'
    },
    {
      label: 'DELETE',
      value: '"DELETE"'
    },
  ];

  private currentMapKey: string;
  private ngDestroy: SingleEmissionSubject = SingleEmissionSubject.create();

  constructor(private editorService: EditorService, private mapperService: MapperService) {
  }

  ngOnInit() {
    const mapperState$ = this.mapperService.state$.pipe(shareReplay());
    const editorContext$ = mapperState$.pipe(selectedInputKey);

    const valueChange$ = this.editor.valueChange
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );

    this.displayHints$ = this.editor.valueChange
      .pipe(map((value) => !value && this.hints && this.hints.length > 0));

    editorContext$
      .pipe(
        switchMap(() => valueChange$),
        takeUntil(this.ngDestroy),
      )
      .subscribe((value: string) => {
        this.mapperService.expressionChange(this.currentMapKey, value);
      });

    this.editor.ready
      .pipe(
        switchMap(() => mapperState$.pipe(selectCurrentEditingExpression)),
        takeUntil(this.ngDestroy),
        filter(context => !!context),
      )
      .subscribe((context) => {
        this.currentMapKey = context.currentKey;
        this.expression = context.expression;
        const newExpression = context.expression || '';
        if (this.editor.value !== newExpression) {
          this.editor.changeModel(newExpression, DEFAULT_EDITOR_OPTIONS.language);
          setTimeout(() => this.editor.onWindowResize(), 0);
        }
      });

    this.editorService.insert$
      .pipe(takeUntil(this.ngDestroy))
      .subscribe((event: InsertEvent) => {
        if (event.replaceTokenAtPosition) {
          this.editor.replaceTokenAtClientPosition(event.text, event.replaceTokenAtPosition);
        } else {
          this.editor.insert(event.text);
        }
      });

    this.editorService.dragOver$
      .pipe(takeUntil(this.ngDestroy))
      .subscribe(position => {
        this.editor.selectTokenAtClientPosition(position);
      });

    const editorReady = new BehaviorSubject<boolean>(false);
    this.editor.ready
      .pipe(takeUntil(this.ngDestroy))
      .subscribe(editorReady);
  }

  hintSelected(hint) {
    this.editor.insert(hint.value);
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();
  }

}
