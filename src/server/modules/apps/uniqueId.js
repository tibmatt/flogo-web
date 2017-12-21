import toString from 'lodash/toString';
import normalizeName from 'lodash/snakeCase'

export class UniqueIdAgent {

  constructor(startFromIndex) {
    this.idCounter = startFromIndex || 0;
    this.uniqueIdArray = [];
  }

  generateUniqueId(name) {
    let uniqueId = normalizeName(name);
    if (this.uniqueIdArray.indexOf(uniqueId) !== -1) {
      let id = ++this.idCounter;
      uniqueId = toString(uniqueId) + '_' + id;
    }
    this.uniqueIdArray.push(uniqueId);

    return uniqueId;
  }

}
