const triggers = require('../samples/triggers.json');

export class TriggerManagerMock {
  find() {
    return Promise.resolve([...triggers]);
  }
}
