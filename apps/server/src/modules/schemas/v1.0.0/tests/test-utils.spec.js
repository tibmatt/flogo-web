import Ajv from 'ajv';
import { expect } from 'chai';
import { SCHEMA_NAMESPACE as V1_SCHEMA_NAMESPACE } from '../schema-namespace';

class Asserter {
  constructor(isValid, errors) {
    this.isValid = isValid;
    this.errors = errors;
  }

  /**
   * @return {Asserter}
   */
  assertIsValid() {
    expect(this.isValid).to.equal(true);
    return this;
  }

  /**
   * @return {Asserter}
   */
  assertIsInvalid() {
    expect(this.isValid).to.equal(false);
    return this;
  }

  /**
   * @return {Asserter}
   */
  assertHasErrorForRequiredProp(propertyName) {
    expect(this.errors[0]).to.deep.include({
      keyword: 'required',
      params: { missingProperty: propertyName },
    });
    return this;
  }

  /**
   * @return {Asserter}
   */
  assertHasErrorForEmptyProp(propertyName) {
    expect(this.errors[0]).to.deep.include({
      keyword: 'minLength',
      dataPath: `.${propertyName}`,
    });
    return this;
  }

  assertHasErrorForMismatchingPropertyType(propertyName, expectedType) {
    expect(this.errors[0]).to.deep.include({
      dataPath: `.${propertyName}`,
      keyword: 'type',
      params: {type: expectedType},
    });
  }

  assertHasErrorForMismatchingPattern(propertyName) {
    expect(this.errors[0]).to.deep.include({
      keyword: 'pattern',
      dataPath: `.${propertyName}`,

    });
  }

  assertHasErrorForMismatchingPropertyEnum(propertyName, expectedType) {
    expect(this.errors[0]).to.deep.include({
      dataPath: `.${propertyName}`,
      keyword: 'enum',
      params: {allowedValues: expectedType},
    });
  }
}

class Validator {

  constructor(validateFn, errorsHolder) {
    this.validateFn = validateFn;
    this.errorsHolder = errorsHolder;
    this.isValid = false;
    this.errors = null;
  }

  validate(value) {
    this.isValid = this.validateFn(value);
    this.errors = this.errorsHolder.errors;
    return this.isValid;
  }

  /**
   *
   * @return {Asserter}
   */
  createAsserter() {
    return new Asserter(this.isValid, this.errors);
  }

  /**
   *
   * @param value
   * @return {Asserter}
   */
  validateAndCreateAsserter(value) {
    this.validate(value);
    return this.createAsserter();
  }

}

class AjvTestContext {
  /**
   * @param {Object} params
   * @param {string} params.mainSchemaName
   * @param {string} params.schemaNamespace
   * @param {ajv.Options} params.ajvOptions
   */
  constructor({ mainSchemaName, schemaNamespace, ajvOptions }) {
    this.ajv = new Ajv({ ...ajvOptions });
    this.schemaNamespace = schemaNamespace;
    this.mainSchemaName = mainSchemaName;
    this.ajvOptions = ajvOptions;
  }

  /**
   * @return {Validator}
   */
  createValidator() {
    return new Validator(value => this.validate(value), this.ajv);
  }

  compileDefinitionSubschema(definitionName) {
    return this.ajv.compile({
      $id: `${this.schemaNamespace}/test.json`,
      $ref: `${this.mainSchemaName}.json#/definitions/${definitionName}`,
    });
  }

  /**
   * @return {Validator}
   */
  createValidatorForSubschema(definitionName) {
    const validFn = this.compileDefinitionSubschema(definitionName);
    return new Validator(validFn, validFn);
  }

  validate(value) {
    return this.ajv.validate(`${V1_SCHEMA_NAMESPACE}/${this.mainSchemaName}.json`, value);
  }

  getErrors() {
    return this.ajv.errors;
  }

  firstError() {
    const [firstError] = this.ajv.errors;
    return firstError;
  }

  /**
   * @param {ajv.Options} mergeAjvOptionsWith
   * @return {AjvTestContext}
   */
  cloneContext(mergeAjvOptionsWith) {
    return new AjvTestContext({
      mainSchemaName: this.mainSchemaName,
      schemaNamespace: this.schemaNamespace,
      ajvOptions: { ...this.ajvOptions, ...mergeAjvOptionsWith },
    });
  }
}

/**
 *
 * @param mainSchemaName
 * @param schemas
 * @param additionalAjvOptions
 * @return {AjvTestContext}
 */
export function makeAjvContext(mainSchemaName, schemas, additionalAjvOptions) {
  return new AjvTestContext({
    mainSchemaName,
    schemaNamespace: V1_SCHEMA_NAMESPACE,
    ajvOptions: { ...additionalAjvOptions, schemas },
  });
}

