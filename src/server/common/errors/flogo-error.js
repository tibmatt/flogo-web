export class FlogoError {

  constructor(message, {type, details} = {}) {
    this.name = 'FlogoError';
    this.message = message;
    this.stack = new Error().stack; // Optional

    this.isOperational = true;

    this.type = type;

    if (details) {
      this.details = Object.assign({}, details);
    }

  }
}
FlogoError.prototype = Object.create(Error.prototype);
