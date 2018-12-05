export interface KeyValue {
  key: string;
  value: string;
}

export interface SettingGroup {
  key: string;
  settings: any;
}

export const OTHER_CATEGORY = 'other';

const sortCategories = function(a, b) {
  const nameA = a.key.toUpperCase();
  const nameB = b.key.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  // names must be equal
  return 0;
};

export function importSettings(settings: any) {
  const convertedSettings: SettingGroup[] = [];

  if (!settings) {
    return null;
  }
  // iterate over settings properties
  const keys = Object.keys(settings);

  keys.forEach(key => {
    const keyParts = key.split(':');
    let category;
    let fieldName;

    if (keyParts.length) {
      if (keyParts.length >= 2) {
        category = keyParts[0];
        fieldName = keyParts[1];
      } else {
        category = OTHER_CATEGORY;
        fieldName = keyParts[0];
      }

      const hostCategory = convertedSettings.find(current => {
        return current.key === category;
      });

      if (!hostCategory) {
        const newCategory: SettingGroup = {
          key: category,
          settings: { [fieldName]: settings[key] },
        };
        convertedSettings.push(newCategory);
      } else {
        hostCategory.settings[fieldName] = settings[key];
      }
    }
  });

  const other = convertedSettings.find(input => input.key === OTHER_CATEGORY);
  if (!other) {
    convertedSettings.push({ key: OTHER_CATEGORY, settings: {} });
  }

  return convertedSettings; // .sort(sortCategories);
}

export function serializeSettings(settingGroups: SettingGroup[]) {
  const convertedSettings: any = {};

  settingGroups.forEach(setting => {
    const category = setting.key;
    const settings = Object.keys(setting.settings);

    settings.forEach(categorySetting => {
      let settingName = '';
      if (category !== OTHER_CATEGORY) {
        settingName = `${category}:${categorySetting}`;
      } else {
        settingName = `${categorySetting}`;
      }
      convertedSettings[settingName] = setting.settings[categorySetting];
    });
  });

  return convertedSettings;
}
