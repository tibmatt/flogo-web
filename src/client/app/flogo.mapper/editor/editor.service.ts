import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/withLatestFrom';

import { EditorContext, InsertEvent } from './types';

export { EditorContext, InsertEvent };

@Injectable()
export class EditorService {

  private contextSrc = new ReplaySubject<EditorContext>(1);
  context$: Observable<EditorContext> = this.contextSrc.asObservable();
  private insertSrc = new Subject<InsertEvent>();
  insert$: Observable<InsertEvent> = this.insertSrc.asObservable();
  private expressionSrc = new Subject<string>();
  outputExpression$: Observable<string> = this.expressionSrc.asObservable();
  private validationSrc = new ReplaySubject<any[]>(1);
  validate$: Observable<any[]> = this.validationSrc.asObservable();
  private dragOverSrc = new Subject<{ x: number, y: number }>();
  dragOver$: Observable<{ x: number, y: number }> = this.dragOverSrc.asObservable();

  changeContext(expression: string) {
    this.contextSrc.next({ expression });
  }

  insertText(string: string, replaceTokenAtPosition?: { x: number, y: number }) {
    this.insertSrc.next({ text: string, replaceTokenAtPosition });
  }

  dragOver(position: { x: number, y: number }) {
    this.dragOverSrc.next(position);
  }

  outputExpression(expression: string) {
    this.expressionSrc.next(expression);
  }

  validated(errors: any[]) {
    this.validationSrc.next(errors);
  }

}
