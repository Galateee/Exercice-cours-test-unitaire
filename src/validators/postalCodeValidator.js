import ValidationError from "./ValidationError";

/**
 * Validates that a postal code follows the French format (exactly 5 digits).
 *
 * @function validatePostalCode
 * @param {string} postalCode - The postal code to validate
 * @throws {ValidationError} Throws an exception with a specific error code if validation fails
 * @returns {void}
 */
function validatePostalCode(postalCode) {
  if (postalCode === undefined || postalCode === null || postalCode === "") {
    throw new ValidationError("Postal code is required", "MISSING_POSTAL_CODE");
  }

  if (typeof postalCode !== "string") {
    throw new ValidationError("Postal code must be a string", "INVALID_POSTAL_CODE_TYPE");
  }

  const postalCodeRegex = /^[0-9]{5}$/;

  if (!postalCodeRegex.test(postalCode)) {
    throw new ValidationError("Postal code must be exactly 5 digits with no spaces or special characters", "INVALID_POSTAL_CODE_FORMAT");
  }
}

export default validatePostalCode;
