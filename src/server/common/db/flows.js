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
    map: function (doc) { emit(doc.updatedAt); }.toString(),
  },
];

export function initViews(db) {
  return commonInitViews(db, views);
}
