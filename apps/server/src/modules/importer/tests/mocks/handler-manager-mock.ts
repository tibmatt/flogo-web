export class HandlerManagerMock {
  static save(triggerId, actionId, handler) {
    const now = new Date().toISOString();
    return Promise.resolve({
      ...handler,
      triggerId,
      actionId,
      createdAt: now,
      updatedAt: null,
      outputs: {},
    });
  }
}
