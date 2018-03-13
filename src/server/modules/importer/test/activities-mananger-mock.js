const activities = require('./samples/activities');

export class ActivitiesManagerMock {
  static find() {
    return Promise.resolve(activities);
  }
}
