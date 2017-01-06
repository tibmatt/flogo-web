import {initViews as _initViews} from './common';

export const VIEWS = {
  name: 'name'
};

const views = [
  {
    key: VIEWS.name,
    map: function(doc) {
      if (doc.name) {
        emit(doc.name.trim().toLowerCase());
      }
    }.toString()
  }
];

export function initViews(db) {

  return _initViews(db, views);

}

