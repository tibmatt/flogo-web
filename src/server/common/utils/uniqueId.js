import toString from 'lodash/toString';

export class UniqueId {

  constructor(startFromIndex) {
    this.idCounter = startFromIndex || 0;
  }

   getUniqueId(prefix) {
    let id = ++this.idCounter;
    return toString(prefix) + id;
  }

}
