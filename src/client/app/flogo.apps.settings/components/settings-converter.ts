
export interface KeyValue {
  key: string
  value: string;
}

export interface Setting {
  key: string;
  settings: any
}

export const OTHER_CATEGORY = 'other';

const sortCategories = function(a, b) {
  var nameA = a.key.toUpperCase();
  var nameB = b.key.toUpperCase();
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
  let convertedSettings: Setting[] = [];

  if(!settings) {
    return null;
  }
  // iterate over settings properties
  const keys = Object.keys(settings);


  keys.forEach((key)=> {
    const keys = key.split(':');
    let category, fieldName;

    if(keys.length) {
      if(keys.length >= 2) {
        category = keys[0];
        fieldName = keys[1];
      } else {
        category = OTHER_CATEGORY;
        fieldName = keys[0];
      }

      const hostCategory = convertedSettings.find((current)=> {
        return current.key === category;
      });

      if(!hostCategory) {
        const newCategory: Setting = {'key': category, 'settings': {[fieldName]: settings[key]}};
        convertedSettings.push(newCategory);
      } else {
        hostCategory.settings[fieldName] = settings[key];
      }
    }
  });

  const other =  convertedSettings.find((input) => input.key === OTHER_CATEGORY);
  if(!other) {
    convertedSettings.push({'key': OTHER_CATEGORY, 'settings': {}});
  }

  return convertedSettings; //.sort(sortCategories);
}


export function convertToDatabaseFormat(settings: Setting[]) {
  let convertedSettings: any = {};

  settings.forEach(setting => {
    const category = setting.key;
    const settings = Object.keys(setting.settings);

    settings.forEach(categorySetting => {
      let settingName: string = '';
      if(category !==  OTHER_CATEGORY) {
        settingName = `${category}:${categorySetting}`;
      } else {
        settingName = `${categorySetting}`;
      }
      convertedSettings[settingName] = setting.settings[categorySetting];
    });
  });

  return convertedSettings;
}
