import { config } from '../../config/app-config';
import { Database } from '../database.service';

import { initViews as _initViews } from './common';


export const VIEWS = {
  name: 'name',
};

const views = [
  {
    key: VIEWS.name,
    map: function (doc) {
      if (doc.name) {
        emit(doc.name.trim().toLowerCase());
      }
    }.toString(),
  },
];

const db = new Database({ filename: config.apps.dbPath, autoload: true }, [{ fieldName: 'name', unique: true }]);
export { db as apps };

export function initViews(db) {
  return _initViews(db, views);
}
