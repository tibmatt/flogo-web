const deviceContribs = require('../samples/device-contribs.json');

export class ContribManagerMock {
  static find() {
    return Promise.resolve([...deviceContribs]);
  }
}
