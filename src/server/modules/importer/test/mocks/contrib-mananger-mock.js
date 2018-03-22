const deviceContribs = require('../samples/device-contribs');

export class ContribManagerMock {
  static find() {
    return Promise.resolve([...deviceContribs]);
  }
}
