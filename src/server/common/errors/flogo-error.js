export class FlogoError extends Error {

  constructor(message, { type, details, ctr } = {}) {
    super();
    this.name = 'FlogoError';
    this.message = message;
    this.stack = new Error().stack; // Optional

    this.isOperational = true;

    this.type = type;

    Error.captureStackTrace(this, ctr || FlogoError);

    if (details) {
      this.details = Object.assign({}, details);
    }
  }
}
