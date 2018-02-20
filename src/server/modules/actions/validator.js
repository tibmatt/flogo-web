import Ajv from 'ajv';

const actionSchema = require('./schema');

class Validator {

  static validate(data) {
    const ajv = new Ajv({ removeAdditional: true, useDefaults: true, allErrors: true });
    const valid = ajv.validate(actionSchema, data);
    return valid ? null : ajv.errors;
  }

}
export { Validator };
