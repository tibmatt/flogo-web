import { normalizeName } from './normalize-name';

export class UniqueIdAgent {
  constructor(startFromIndex) {
    this.idCounter = startFromIndex || 0;
    this.uniqueIdArray = [];
  }

  generateUniqueId(name) {
    let uniqueId = normalizeName(name);
    if (this.uniqueIdArray.indexOf(uniqueId) !== -1) {
      const id = ++this.idCounter;
      uniqueId = `${uniqueId}_${id}`;
    }
    this.uniqueIdArray.push(uniqueId);

    return uniqueId;
  }
}
