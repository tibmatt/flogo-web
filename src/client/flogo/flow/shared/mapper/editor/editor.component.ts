import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MonacoEditorComponent, DEFAULT_EDITOR_OPTIONS } from '../../monaco-editor';

import { SingleEmissionSubject } from '../shared/single-emission-subject';
import { EditorContext, EditorService, InsertEvent } from './editor.service';
import { combineLatest, debounceTime, distinctUntilChanged, skipUntil, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'flogo-mapper-editor',
  template: `<monaco-editor></monaco-editor>`
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild(MonacoEditorComponent) editor: MonacoEditorComponent;
  expression = '';

  private ngDestroy: SingleEmissionSubject = SingleEmissionSubject.create();

  constructor(private editorService: EditorService) {
  }

  ngOnInit() {
    const editorContext$ = this.editorService.context$
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.ngDestroy),
      );

    const valueChange$ = this.editor.valueChange
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      );
    editorContext$
      .pipe(
        switchMap(() => valueChange$),
        takeUntil(this.ngDestroy),
      )
      .subscribe((value: string) => {
        this.editorService.outputExpression(value);
      });

    this.editor.ready
      .pipe(
        switchMap(() => editorContext$),
        takeUntil(this.ngDestroy),
      )
      .subscribe((context: EditorContext) => {
        if (context) {
          const newExpression = context.expression || '';
          this.editor.changeModel(newExpression, context.mode ? context.mode : DEFAULT_EDITOR_OPTIONS.language);
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

    this.editorService.validate$
      .pipe(
        combineLatest(editorReady, e => e),
        skipUntil(editorReady.filter(isLoaded => isLoaded)),
        takeUntil(this.ngDestroy),
      )
      .subscribe(errors => {
        this.editor.setErrors(errors);
      });
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();
  }

}
