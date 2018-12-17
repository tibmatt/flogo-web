export class AppsTriggersManagerMock {
  static create(appId, trigger) {
    const now = new Date().toISOString();
    return Promise.resolve({
      ...trigger,
      id: `${trigger.name.replace(/\s/g, '-')}-processed`,
      createdAt: now,
      updatedAt: null,
      handlers: [],
      appId,
    });
  }
}
