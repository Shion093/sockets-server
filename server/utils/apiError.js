class ExtendableError extends Error {
  constructor({ message, errors, status, isPublic, stack }) {
    super();
    this.name = this.constructor.name;
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    this.stack = stack;
  }
}

class APIError extends ExtendableError {
  constructor({ message, errors, stack, status = 500, isPublic = false }) {
    super({ message, errors, status, isPublic, stack });
  }
}

module.exports = APIError;