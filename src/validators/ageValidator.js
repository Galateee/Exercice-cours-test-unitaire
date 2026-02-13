import ValidationError from "./ValidationError";

/**
 * Validates that a person is of legal age (>= 18 years) based on their birth date.
 * Performs precise age calculation taking into account the exact day.
 *
 * @function validateAge
 * @param {Date} birthDate - The birth date to validate
 * @param {Date} referenceDate - The reference date for calculation (default: today)
 * @throws {ValidationError} Throws an exception with a specific error code if validation fails
 * @returns {void}
 */
function validateAge(birthDate, referenceDate = new Date()) {
  if (birthDate === undefined || birthDate === null) {
    throw new ValidationError("Birth date is required", "MISSING_DATE");
  }

  if (!(birthDate instanceof Date)) {
    throw new ValidationError("Birth date must be a Date object", "INVALID_DATE_TYPE");
  }

  if (isNaN(birthDate.getTime())) {
    throw new ValidationError("Birth date is invalid", "INVALID_DATE");
  }

  if (birthDate > referenceDate) {
    throw new ValidationError("Birth date cannot be in the future", "FUTURE_DATE");
  }

  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age > 150) {
    throw new ValidationError("Calculated age is unrealistic (over 150 years)", "AGE_TOO_OLD");
  }

  if (age < 18) {
    throw new ValidationError(`You must be at least 18 years old. Current age: ${age}`, "AGE_TOO_YOUNG");
  }
}

export default validateAge;
