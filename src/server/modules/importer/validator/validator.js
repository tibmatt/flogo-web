export class Validator {
  constructor(schema, ajvInstance) {
    this.schema = schema;
    this.ajvInstance = ajvInstance;
  }

  validate(value) {
    const isValid = this.ajvInstance.validate(this.schema, value);
    return isValid ? null : this.ajvInstance.errors;
  }

}
