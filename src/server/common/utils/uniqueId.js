import toString from 'lodash/toString';
import normalizeName from 'lodash/snakeCase'

export class UniqueIdGenerator {

  constructor(startFromIndex) {
    this.idCounter = startFromIndex || 0;
    this.uniqueActionIdArray = [];
  }

  getUniqueId(actionName) {
    let actionId = normalizeName(actionName);
    if (this.uniqueActionIdArray.indexOf(actionId) !== -1) {
      let id = ++this.idCounter;
      actionId = toString(actionId) + '_' + id;
    }
    this.uniqueActionIdArray.push(actionId);

    return actionId;
  }

}
