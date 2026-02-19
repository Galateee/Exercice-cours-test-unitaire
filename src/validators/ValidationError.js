/**
 * Custom error class for validation errors
 * Extends the native Error class with an additional error code property
 *
 * @class ValidationError
 * @extends Error
 *
 * @param {string} message - Human-readable error message describing the validation failure
 * @param {string} code - Machine-readable error code for programmatic error handling
 *                        (e.g., INVALID_EMAIL_FORMAT, MISSING_DATE, AGE_TOO_YOUNG)
 *
 * @property {string} name - Always set to "ValidationError"
 * @property {string} code - The error code provided during construction
 * @property {string} message - The error message provided during construction
 *
 * @example
 * // Throw a validation error with code
 * throw new ValidationError("Email address must be in a valid format", "INVALID_EMAIL_FORMAT");
 *
 * @example
 * // Catch and handle validation error
 * try {
 *   validateEmail("invalid-email");
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.log(error.code); // "INVALID_EMAIL_FORMAT"
 *     console.log(error.message); // "Email address must be in a valid format"
 *   }
 * }
 */
class ValidationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
  }
}

export default ValidationError;
