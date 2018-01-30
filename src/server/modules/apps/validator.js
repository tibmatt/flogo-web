import defaults from 'lodash/defaults';
import Ajv from 'ajv';

import { FLOGO_PROFILE_TYPES } from '../../common/constants';
import {
  activityDeviceSchemaCreate,
  appSchema,
  deviceAppSchema,
  fullAppSchema,
  fullDeviceAppSchema,
  handlerEditableSchema,
  triggerDeviceSchemaCreate,
  triggerSchemaCreate,
  triggerSchemaUpdate,
} from './schemas';

function validate(schema, data, options = {}, customValidations) {
  const ajv = new Ajv(options);

  if (customValidations) {
    customValidations.forEach(validator => ajv.addKeyword(
      validator.keyword,
      { validate: validator.validate, errors: true }),
    );
  }

  const valid = ajv.validate(schema, data);
  return valid ? null : ajv.errors;
}


export class Validator {

  static validateSimpleApp(data, isDeviceType) {
    let validationSchema;
    if (isDeviceType) {
      validationSchema = deviceAppSchema();
    } else {
      validationSchema = appSchema();
    }
    return validate(validationSchema, data, { removeAdditional: true, useDefaults: true, allErrors: true });
  }

  static validateTriggerCreate(data) {
    return validate(triggerSchemaCreate(), data, { removeAdditional: true, useDefaults: true, allErrors: true });
  }

  static validateTriggerDeviceCreate(data) {
    return validate(triggerDeviceSchemaCreate(), data, { removeAdditional: true, useDefaults: true, allErrors: true });
  }

  static validateActivityDeviceCreate(data) {
    return validate(activityDeviceSchemaCreate(), data, { removeAdditional: true, useDefaults: true, allErrors: true });
  }

  static validateTriggerUpdate(data) {
    return validate(triggerSchemaUpdate(), data, { removeAdditional: true, useDefaults: true, allErrors: true });
  }

  static validateHandler(data) {
    return validate(handlerEditableSchema(), data, { removeAdditional: true, useDefaults: true, allErrors: true });
  }

  static validateFullApp(profileType, data, contribVerify, options) {
    options = defaults({}, options, { removeAdditional: false, useDefaults: false, allErrors: true, verbose: true });
    let customValidations;
    if (contribVerify) {
      const makeInstalledValidator = (keyword, collection, type) => function validator(schema, vData) {
        const isInstalled = collection.includes(vData);
        if (!isInstalled) {
          validator.errors = [{ keyword, message: `${type} "${vData}" is not installed`, data }];
        }
        return isInstalled;
      };

      customValidations = [
        { keyword: 'trigger-installed', validate: makeInstalledValidator('trigger-installed', contribVerify.triggers || [], 'Trigger') },
        { keyword: 'activity-installed', validate: makeInstalledValidator('activity-installed', contribVerify.activities || [], 'Activity') },
      ];
    }

    let schemaToUse;
    if (profileType === FLOGO_PROFILE_TYPES.MICRO_SERVICE) {
      schemaToUse = fullAppSchema();
    } else {
      schemaToUse = fullDeviceAppSchema();
    }

    const errors = validate(schemaToUse, data, options, customValidations);
    if (errors && errors.length > 0) {
      // get rid of some info we don't want to expose
      errors.forEach(e => {
        delete e.params;
        delete e.schema;
        delete e.parentSchema;
      });
    }
    return errors;
  }

}
