import ValidationError from "./ValidationError";

/**
 * Validates that a name or first name follows proper format rules.
 *
 * @function validateIdentity
 * @param {string} identity - The name or first name to validate
 * @throws {ValidationError} Throws an exception with a specific error code if validation fails
 * @returns {void}
 */
function validateIdentity(identity) {
  if (identity === undefined || identity === null || identity === "") {
    throw new ValidationError("Name or first name is required", "MISSING_IDENTITY");
  }

  if (typeof identity !== "string") {
    throw new ValidationError("Name or first name must be a string", "INVALID_IDENTITY_TYPE");
  }

  if (identity.trim() === "") {
    throw new ValidationError("Name or first name cannot be only whitespace", "MISSING_IDENTITY");
  }

  if (identity !== identity.trim()) {
    throw new ValidationError("Name or first name must not have leading or trailing whitespace", "INVALID_IDENTITY_FORMAT");
  }

  if (identity.length < 2) {
    throw new ValidationError("Name or first name must be at least 2 characters long", "IDENTITY_TOO_SHORT");
  }

  if (identity.length > 50) {
    throw new ValidationError("Name or first name must not exceed 50 characters", "IDENTITY_TOO_LONG");
  }

  // XSS protection - detect HTML tags and JavaScript
  const xssPatterns = [/<[^>]*>/g, /javascript:/gi, /on\w+\s*=/gi];

  for (const pattern of xssPatterns) {
    if (pattern.test(identity)) {
      throw new ValidationError("Potential XSS injection detected. HTML tags and JavaScript are not allowed", "XSS_DETECTED");
    }
  }

  const identityRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;

  if (!identityRegex.test(identity)) {
    throw new ValidationError("Name or first name can only contain letters, accents, hyphens, apostrophes, and spaces. No digits or special characters allowed", "INVALID_IDENTITY_FORMAT");
  }
}

export default validateIdentity;
