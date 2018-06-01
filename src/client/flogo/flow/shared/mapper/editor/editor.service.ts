import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';

import { EditorContext, InsertEvent } from './types';

export { EditorContext, InsertEvent };

@Injectable()
export class EditorService {
  private insertSrc = new Subject<InsertEvent>();
  insert$: Observable<InsertEvent> = this.insertSrc.asObservable();
  private expressionSrc = new Subject<{ mapKey: string, expression: string }>();
  outputExpression$: Observable<{ mapKey: string, expression: string }> = this.expressionSrc.asObservable();
  private validationSrc = new ReplaySubject<any[]>(1);
  validate$: Observable<any[]> = this.validationSrc.asObservable();
  private dragOverSrc = new Subject<{ x: number, y: number }>();
  dragOver$: Observable<{ x: number, y: number }> = this.dragOverSrc.asObservable();

  insertText(string: string, replaceTokenAtPosition?: { x: number, y: number }) {
    this.insertSrc.next({ text: string, replaceTokenAtPosition });
  }

  dragOver(position: { x: number, y: number }) {
    this.dragOverSrc.next(position);
  }

  outputExpression(mapKey: string, expression: string) {
    this.expressionSrc.next({ mapKey, expression });
  }

  validated(errors: any[]) {
    this.validationSrc.next(errors);
  }

}
