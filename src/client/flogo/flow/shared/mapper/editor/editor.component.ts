import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, shareReplay, switchMap, takeUntil, filter, map, startWith } from 'rxjs/operators';

import { MonacoEditorComponent, DEFAULT_EDITOR_OPTIONS } from '../../monaco-editor';
import { SingleEmissionSubject } from '../shared/single-emission-subject';

import { MapperState } from '../models';
import { MapperService } from '../services/mapper.service';
import { selectCurrentEditingExpression, selectedInputKey } from '../services/selectors';
import { EditorService, InsertEvent } from './editor.service';

function distinctAndDebounce(obs) {
  return obs.pipe(
    debounceTime(300),
    distinctUntilChanged(),
  );
}

@Component({
  selector: 'flogo-mapper-editor',
  template: `
    <div class="hints-overlay" *ngIf="displayHints$ | async">
      <button *ngFor="let hint of hints"
              class="hints-overlay__hint"
              (click)="onHintSelected(hint)">{{ hint.label }}
      </button>
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
    this.setupExternalModelChanges(mapperState$);

    const editorContext$ = mapperState$.pipe(selectedInputKey);
    this.displayHints$ = this.createHintsStream(editorContext$);
    this.subscribeToValueChanges(editorContext$);

    this.editorService.insert$
      .pipe(takeUntil(this.ngDestroy))
      .subscribe((event: InsertEvent) => {
        if (event.replaceTokenAtPosition) {
          this.editor.replaceTokenAtClientPosition(event.text, event.replaceTokenAtPosition);
        } else {
          this.editor.insert(event.text);
        }
        this.editor.focus();
      });

    this.editorService.dragOver$
      .pipe(takeUntil(this.ngDestroy))
      .subscribe(position => {
        this.editor.selectTokenAtClientPosition(position);
      });
  }

  onHintSelected(hint) {
    this.editor.insert(hint.value);
    this.editor.focus();
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();
  }

  private subscribeToValueChanges(editorContext$) {
    const valueChange$ = distinctAndDebounce(this.editor.valueChange);
    editorContext$
      .pipe(
        switchMap(() => valueChange$),
        takeUntil(this.ngDestroy),
      )
      .subscribe((value: string) => {
        this.mapperService.expressionChange(this.currentMapKey, value);
      });
  }

  private setupExternalModelChanges(mapperState$: Observable<MapperState>) {
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
  }

  private createHintsStream(editorContext$) {
    const getCurrentValueStream = () => this.editor.valueChange.pipe(startWith(this.editor.value));
    return this.editor.ready
      .pipe(
        switchMap(() => editorContext$),
        switchMap(() => getCurrentValueStream()),
        map((value) => !value && this.hints && this.hints.length > 0),
      );
  }

}
