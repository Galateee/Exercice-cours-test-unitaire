import ValidationError from "./ValidationError";

/**
 * Validates that an email address follows a standard valid format.
 *
 * @function validateEmail
 * @param {string} email - The email address to validate
 * @throws {ValidationError} Throws an exception with a specific error code if validation fails
 * @returns {void}
 */
function validateEmail(email) {
  if (email === undefined || email === null || email === "") {
    throw new ValidationError("Email address is required", "MISSING_EMAIL");
  }

  if (typeof email !== "string") {
    throw new ValidationError("Email address must be a string", "INVALID_EMAIL_TYPE");
  }

  if (email.trim() === "") {
    throw new ValidationError("Email address cannot be only whitespace", "MISSING_EMAIL");
  }

  if (email !== email.trim()) {
    throw new ValidationError("Email address must not have leading or trailing whitespace", "INVALID_EMAIL_FORMAT");
  }

  if (email.length > 254) {
    throw new ValidationError("Email address must not exceed 254 characters", "EMAIL_TOO_LONG");
  }

  // XSS protection - detect HTML tags and JavaScript
  const xssPatterns = [/<[^>]*>/g, /javascript:/gi, /on\w+\s*=/gi];

  for (const pattern of xssPatterns) {
    if (pattern.test(email)) {
      throw new ValidationError("Potential XSS injection detected. HTML tags and JavaScript are not allowed in email", "XSS_DETECTED");
    }
  }

  // Format check - standard email format
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    throw new ValidationError("Email address must be in a valid format (example@domain.com)", "INVALID_EMAIL_FORMAT");
  }

  if (/\.\./.test(email.split("@")[0])) {
    throw new ValidationError("Email address cannot have consecutive dots in local part", "INVALID_EMAIL_FORMAT");
  }

  const localPart = email.split("@")[0];
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    throw new ValidationError("Email address local part cannot start or end with a dot", "INVALID_EMAIL_FORMAT");
  }
}

export default validateEmail;
