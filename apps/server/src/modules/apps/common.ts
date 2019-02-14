import { escapeRegExp } from 'lodash';
import { Database } from '../../common/database.service';
import { findGreatestNameIndex } from '../../common/utils/collection';

export async function saveNew(app, appsDb: Database) {
  const uniqueName = await ensureUniqueName(app.name, appsDb);
  app.name = uniqueName;
  return appsDb.insert(app);
}

function ensureUniqueName(forName, appsDb: Database) {
  const normalizedName = escapeRegExp(forName.trim().toLowerCase());
  return appsDb.find({ name: new RegExp(`^${normalizedName}`, 'i') }).then(apps => {
    const greatestIndex = findGreatestNameIndex(forName, apps);
    return greatestIndex < 0 ? forName : `${forName} (${greatestIndex + 1})`;
  });
}
