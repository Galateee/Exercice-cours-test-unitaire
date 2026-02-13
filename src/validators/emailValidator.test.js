import validateEmail from "./emailValidator";

/**
 * @function validateEmail
 */
describe("validateEmail - Email format validation", () => {
  describe("Valid cases - Correct email formats", () => {
    it("should accept standard email addresses", () => {
      expect(() => validateEmail("john.doe@example.com")).not.toThrow();
      expect(() => validateEmail("user@domain.org")).not.toThrow();
      expect(() => validateEmail("test@test.fr")).not.toThrow();
    });

    it("should accept emails with plus sign", () => {
      expect(() => validateEmail("user+tag@example.com")).not.toThrow();
      expect(() => validateEmail("john+work@company.org")).not.toThrow();
    });

    it("should accept emails with numbers", () => {
      expect(() => validateEmail("user123@example.com")).not.toThrow();
      expect(() => validateEmail("123user@domain.net")).not.toThrow();
    });

    it("should accept emails with dots in local part", () => {
      expect(() => validateEmail("first.last@example.com")).not.toThrow();
      expect(() => validateEmail("john.doe.smith@company.org")).not.toThrow();
    });

    it("should accept emails with hyphens in domain", () => {
      expect(() => validateEmail("user@my-domain.com")).not.toThrow();
      expect(() => validateEmail("test@sub-domain.example.org")).not.toThrow();
    });

    it("should accept emails with underscores", () => {
      expect(() => validateEmail("user_name@example.com")).not.toThrow();
      expect(() => validateEmail("test_user@domain.org")).not.toThrow();
    });

    it("should accept emails with subdomains", () => {
      expect(() => validateEmail("user@mail.example.com")).not.toThrow();
      expect(() => validateEmail("test@subdomain.domain.org")).not.toThrow();
    });

    it("should accept emails with various TLDs", () => {
      expect(() => validateEmail("user@example.com")).not.toThrow();
      expect(() => validateEmail("user@example.co.uk")).not.toThrow();
      expect(() => validateEmail("user@example.info")).not.toThrow();
    });
  });

  describe("Invalid cases - Missing parts", () => {
    it("should reject emails without @", () => {
      expect(() => validateEmail("userexample.com")).toThrow();
      expect(() => validateEmail("user.example.com")).toThrow();
    });

    it("should reject emails without local part", () => {
      expect(() => validateEmail("@example.com")).toThrow();
    });

    it("should reject emails without domain", () => {
      expect(() => validateEmail("user@")).toThrow();
      expect(() => validateEmail("user@.com")).toThrow();
    });

    it("should reject emails without TLD", () => {
      expect(() => validateEmail("user@domain")).toThrow();
    });

    it("should throw an exception with code INVALID_EMAIL_FORMAT", () => {
      expect(() => validateEmail("userexample.com")).toThrow(
        expect.objectContaining({
          code: "INVALID_EMAIL_FORMAT",
        }),
      );
    });
  });

  describe("Invalid cases - Invalid characters", () => {
    it("should reject emails with spaces", () => {
      expect(() => validateEmail("user name@example.com")).toThrow();
      expect(() => validateEmail("user@exam ple.com")).toThrow();
    });

    it("should reject emails with special characters in wrong places", () => {
      expect(() => validateEmail("user..name@example.com")).toThrow(); // consecutive dots
      expect(() => validateEmail(".user@example.com")).toThrow(); // starting dot
      expect(() => validateEmail("user.@example.com")).toThrow(); // ending dot
    });

    it("should reject emails with invalid special characters", () => {
      expect(() => validateEmail("user#name@example.com")).toThrow();
      expect(() => validateEmail("user@exam#ple.com")).toThrow();
      expect(() => validateEmail("user$@example.com")).toThrow();
    });

    it("should reject emails with multiple @", () => {
      expect(() => validateEmail("user@@example.com")).toThrow();
      expect(() => validateEmail("user@domain@example.com")).toThrow();
    });

    it("should throw an exception with explicit message", () => {
      expect(() => validateEmail("invalid-email")).toThrow(/valid format/i);
    });
  });

  describe("Invalid cases - XSS protection", () => {
    it("should reject emails with HTML tags", () => {
      expect(() => validateEmail("<script>@example.com")).toThrow();
      expect(() => validateEmail("user@<script>.com")).toThrow();
    });

    it("should reject emails with JavaScript", () => {
      expect(() => validateEmail("javascript:alert@example.com")).toThrow();
    });

    it("should throw an exception with code XSS_DETECTED for HTML", () => {
      expect(() => validateEmail("<script>@example.com")).toThrow(
        expect.objectContaining({
          code: "XSS_DETECTED",
        }),
      );
    });
  });

  describe("Edge cases and validation errors", () => {
    it("should reject empty string", () => {
      expect(() => validateEmail("")).toThrow(
        expect.objectContaining({
          code: "MISSING_EMAIL",
        }),
      );
    });

    it("should reject null value", () => {
      expect(() => validateEmail(null)).toThrow(
        expect.objectContaining({
          code: "MISSING_EMAIL",
        }),
      );
    });

    it("should reject undefined value", () => {
      expect(() => validateEmail()).toThrow(
        expect.objectContaining({
          code: "MISSING_EMAIL",
        }),
      );
    });

    it("should reject non-string types - number", () => {
      expect(() => validateEmail(123)).toThrow(
        expect.objectContaining({
          code: "INVALID_EMAIL_TYPE",
        }),
      );
    });

    it("should reject non-string types - object", () => {
      expect(() => validateEmail({ email: "test@example.com" })).toThrow(
        expect.objectContaining({
          code: "INVALID_EMAIL_TYPE",
        }),
      );
    });

    it("should reject non-string types - array", () => {
      expect(() => validateEmail(["test@example.com"])).toThrow(
        expect.objectContaining({
          code: "INVALID_EMAIL_TYPE",
        }),
      );
    });

    it("should reject emails with only spaces", () => {
      expect(() => validateEmail("     ")).toThrow(
        expect.objectContaining({
          code: "MISSING_EMAIL",
        }),
      );
    });

    it("should reject emails that are too long (> 254 characters)", () => {
      const longEmail = "a".repeat(250) + "@test.com";
      expect(() => validateEmail(longEmail)).toThrow(
        expect.objectContaining({
          code: "EMAIL_TOO_LONG",
        }),
      );
    });

    it("should reject leading/trailing whitespace", () => {
      expect(() => validateEmail(" user@example.com")).toThrow();
      expect(() => validateEmail("user@example.com ")).toThrow();
      expect(() => validateEmail(" user@example.com ")).toThrow();
    });
  });
});
