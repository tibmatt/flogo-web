const activities = require('../samples/activities.json');

export class ActivitiesManagerMock {
  find() {
    return Promise.resolve([...activities]);
  }
}
