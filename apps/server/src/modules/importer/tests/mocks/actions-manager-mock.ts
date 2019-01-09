const commonApp = require('../samples/common-app-details.json');

export class ActionsManagerMockClass {
  create(appId, actionData) {
    const now = new Date().toISOString();
    const action = {
      ...actionData,
      id: `${actionData.id}-processed`,
      createdAt: now,
      updatedAt: null,
      appId,
      app: {
        ...commonApp,
        createdAt: now,
        updatedAt: null,
        id: appId,
      },
    };

    if (action.data && action.data.flow && action.data.flow.name) {
      action.name = action.data.flow.name;
      delete action.data.flow.name;
    } else if (!action.name) {
      action.name = action.id;
    }

    return Promise.resolve(action);
  }

  update(actionId, action) {
    return Promise.resolve({ ...action });
  }
}
export const ActionsManagerMock = new ActionsManagerMockClass();
