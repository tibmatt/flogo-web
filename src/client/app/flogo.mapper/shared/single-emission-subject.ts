import { Subject } from 'rxjs/Subject';

export class SingleEmissionSubject extends Subject<void> {

  static create() {
    return new SingleEmissionSubject();
  }

  constructor() {
    super();
  }

  emitAndComplete() {
    this.next();
    this.complete();
  }

}
