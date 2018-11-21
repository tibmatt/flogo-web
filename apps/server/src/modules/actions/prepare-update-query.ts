import mapKeys from 'lodash/mapKeys';

interface UpdateQuery {
  $set?: any;
  $unset?: any;
}

export function prepareUpdateQuery(newAction, oldAction, indexOfAction) {
  const updateQuery: UpdateQuery = {};
  const modifierPrefix = `actions.${indexOfAction}`;
  const removeMainHandler = oldAction.tasks && !newAction.tasks;
  const removeErrorHandler = oldAction.errorHandler && !newAction.errorHandler;
  // makes { $set: { 'actions.1.name': 'my action' } };
  updateQuery.$set = mapKeys(newAction, (v, fieldName) => `${modifierPrefix}.${fieldName}`);
  /***
   * Apart from updating all the fields coming from the new action data, In case when empty items in main handler
   * and error handler, then we need to unset the 'tasks', 'links' and 'errorHandler' from action
   *
   * if removeMainHandler is flagged true
   *    { $unset: {'actions.1.tasks': true, 'actions.1.links': true}}
   *
   * if removeErrorHandler is flagged true
   *    { $unset: {'actions.1.errorHandler': true}}
   */
  if (removeMainHandler || removeErrorHandler) {
    updateQuery.$unset = {};
    if (removeMainHandler) {
      updateQuery.$unset[`${modifierPrefix}.tasks`] = true;
      updateQuery.$unset[`${modifierPrefix}.links`] = true;
    }
    if (removeErrorHandler) {
      updateQuery.$unset[`${modifierPrefix}.errorHandler`] = true;
    }
  }
  return updateQuery;
}
