/**
 * Custom error class for validation errors
 */
class ValidationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
  }
}

export default ValidationError;
