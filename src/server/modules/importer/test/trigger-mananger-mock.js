const triggers = require('./samples/triggers');

export class TriggerManagerMock {
  static find() {
    return Promise.resolve([...triggers]);
  }
}
