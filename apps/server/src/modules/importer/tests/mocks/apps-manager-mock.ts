export class AppsManagerMock {
  static create(app) {
    const now = new Date().toISOString();
    return Promise.resolve({
      ...app,
      id: `${app.name}-processed`,
      createdAt: now,
      updatedAt: null,
      triggers: [],
      actions: [],
    });
  }
}
