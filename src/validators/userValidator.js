import validateAge from "./ageValidator";
import validatePostalCode from "./postalCodeValidator";
import validateIdentity from "./identityValidator";
import validateEmail from "./emailValidator";

/**
 * Validates a complete user form with all required fields.
 * This is the main validation function that orchestrates all individual validations.
 *
 * @function validateUser
 * @param {Object} userData - The user data object to validate
 * @param {string} userData.firstName - The user's first name
 * @param {string} userData.lastName - The user's last name
 * @param {Date} userData.birthDate - The user's birth date
 * @param {string} userData.email - The user's email address
 * @param {string} userData.postalCode - The user's postal code
 * @returns {boolean} Returns true if all validations pass, false otherwise
 *
 * @example
 * const userData = {
 *   firstName: "Jean",
 *   lastName: "Dupont",
 *   birthDate: new Date(1990, 0, 1),
 *   email: "jean.dupont@example.com",
 *   postalCode: "75001"
 * };
 * const isValid = validateUser(userData); // returns true
 */
function validateUser(userData) {
  try {
    // Validate that userData is provided and is an object
    if (!userData || typeof userData !== "object" || Array.isArray(userData)) {
      return false;
    }

    // Validate all required fields using individual validation functions
    validateIdentity(userData.firstName);
    validateIdentity(userData.lastName);
    validateAge(userData.birthDate);
    validateEmail(userData.email);
    validatePostalCode(userData.postalCode);

    // All validations passed
    return true;
  } catch (error) {
    // Any validation error results in returning false
    return false;
  }
}

export default validateUser;
