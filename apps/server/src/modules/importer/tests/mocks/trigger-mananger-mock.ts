const triggers = require('../samples/triggers.json');

export class TriggerManagerMock {
  static find() {
    return Promise.resolve([...triggers]);
  }
}
