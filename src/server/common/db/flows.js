import { initViews as commonInitViews } from './common';

export const VIEWS = {
  appId: 'appId',
  updatedAt: 'updatedAt',
};

const views = [
  {
    key: VIEWS.appId,
    map: function (doc) { emit(doc.appId || 'DEFAULT-APP'); }.toString(),
  },
  {
    key: VIEWS.updatedAt,
    // TODO update to updatedAt through the application
    map: function (doc) {
      if (doc.updated_at) {
        emit(doc.updated_at || doc.updatedAt);
      }
    }.toString(),
  },
];

export function initViews(db) {
  return commonInitViews(db, views);
}
