const activities = require('../samples/activities.json');

export class ActivitiesManagerMock {
  static find() {
    return Promise.resolve([...activities]);
  }
}
