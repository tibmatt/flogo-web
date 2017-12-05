import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/skipUntil';
import 'rxjs/add/operator/takeUntil';

import { MonacoEditorComponent, DEFAULT_EDITOR_OPTIONS } from '../../monaco-editor';

import { SingleEmissionSubject } from '../shared/single-emission-subject';
import { EditorContext, EditorService, InsertEvent } from './editor.service';

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
    this.editorService.context$
      .distinctUntilChanged()
      .takeUntil(this.ngDestroy)
      .subscribe((context: EditorContext) => {
        if (context) {
          const newExpression = context.expression || '';
          this.editor.changeModel(newExpression, context.mode ? context.mode : DEFAULT_EDITOR_OPTIONS.language);
          setTimeout(() => this.editor.onWindowResize(), 0);
        }
      });

    this.editorService.insert$
      .takeUntil(this.ngDestroy)
      .subscribe((event: InsertEvent) => {
        if (event.replaceTokenAtPosition) {
          this.editor.replaceTokenAtClientPosition(event.text, event.replaceTokenAtPosition);
        } else {
          this.editor.insert(event.text);
        }
      });

    this.editorService.dragOver$
      .takeUntil(this.ngDestroy)
      .subscribe(position => {
        this.editor.selectTokenAtClientPosition(position);
      });

    const editorReady = new BehaviorSubject<boolean>(false);
    this.editor.ready.takeUntil(this.ngDestroy).subscribe(editorReady);

    this.editorService.validate$
      .combineLatest(editorReady, (e, _s) => e)
      .skipUntil(editorReady.filter(isLoaded => isLoaded))
      .takeUntil(this.ngDestroy)
      .subscribe(errors => {
        this.editor.setErrors(errors);
      });

    this.editor.valueChange
      .debounceTime(300)
      .distinctUntilChanged()
      .takeUntil(this.ngDestroy)
      .subscribe(value => {
        this.editorService.outputExpression(value);
      });
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();
  }

}
