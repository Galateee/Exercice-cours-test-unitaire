import validateEmail, { validateUniqueEmail, validateEmailComplete } from "./emailValidator";

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
      expect(() => validateEmail("user..name@example.com")).toThrow();
      expect(() => validateEmail(".user@example.com")).toThrow();
      expect(() => validateEmail("user.@example.com")).toThrow();
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

/**
 * @function validateUniqueEmail
 */
describe("validateUniqueEmail - Email uniqueness validation", () => {
  describe("Valid cases - Unique emails", () => {
    it("should accept email when no users exist", () => {
      const existingUsers = [];
      expect(() => validateUniqueEmail("new@example.com", existingUsers)).not.toThrow();
    });

    it("should accept email when it doesn't exist in the list", () => {
      const existingUsers = [
        { email: "john@example.com", firstname: "John" },
        { email: "jane@example.com", firstname: "Jane" },
      ];
      expect(() => validateUniqueEmail("new@example.com", existingUsers)).not.toThrow();
    });

    it("should accept email with different case when no match exists", () => {
      const existingUsers = [{ email: "john@example.com", firstname: "John" }];
      expect(() => validateUniqueEmail("jane@example.com", existingUsers)).not.toThrow();
    });
  });

  describe("Invalid cases - Duplicate emails", () => {
    it("should reject email that already exists (exact match)", () => {
      const existingUsers = [{ email: "john@example.com", firstname: "John" }];
      expect(() => validateUniqueEmail("john@example.com", existingUsers)).toThrow();
    });

    it("should reject email that already exists (case insensitive)", () => {
      const existingUsers = [{ email: "john@example.com", firstname: "John" }];
      expect(() => validateUniqueEmail("JOHN@EXAMPLE.COM", existingUsers)).toThrow();
      expect(() => validateUniqueEmail("John@Example.com", existingUsers)).toThrow();
      expect(() => validateUniqueEmail("john@EXAMPLE.COM", existingUsers)).toThrow();
    });

    it("should throw ValidationError with code EMAIL_ALREADY_EXISTS", () => {
      const existingUsers = [{ email: "john@example.com", firstname: "John" }];
      expect(() => validateUniqueEmail("john@example.com", existingUsers)).toThrow(
        expect.objectContaining({
          code: "EMAIL_ALREADY_EXISTS",
          message: "This email address is already registered",
        }),
      );
    });

    it("should reject email when multiple users exist and email matches one", () => {
      const existingUsers = [
        { email: "john@example.com", firstname: "John" },
        { email: "jane@example.com", firstname: "Jane" },
        { email: "bob@example.com", firstname: "Bob" },
      ];
      expect(() => validateUniqueEmail("jane@example.com", existingUsers)).toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should handle users without email property", () => {
      const existingUsers = [
        { firstname: "John", lastname: "Doe" },
        { email: "jane@example.com", firstname: "Jane" },
      ];
      expect(() => validateUniqueEmail("new@example.com", existingUsers)).not.toThrow();
    });

    it("should handle empty email in existing users", () => {
      const existingUsers = [
        { email: "", firstname: "John" },
        { email: null, firstname: "Jane" },
      ];
      expect(() => validateUniqueEmail("new@example.com", existingUsers)).not.toThrow();
    });

    it("should work with localStorage when no parameter provided", () => {
      if (typeof localStorage === "undefined") {
        return;
      }

      const originalValue = localStorage.getItem("registeredUsers");

      localStorage.setItem("registeredUsers", JSON.stringify([{ email: "stored@example.com", firstname: "Stored" }]));

      expect(() => validateUniqueEmail("stored@example.com")).toThrow(
        expect.objectContaining({
          code: "EMAIL_ALREADY_EXISTS",
        }),
      );

      if (originalValue) {
        localStorage.setItem("registeredUsers", originalValue);
      } else {
        localStorage.removeItem("registeredUsers");
      }
    });

    it("should accept new email when using localStorage", () => {
      if (typeof localStorage === "undefined") {
        return;
      }

      const originalValue = localStorage.getItem("registeredUsers");
      localStorage.setItem("registeredUsers", JSON.stringify([{ email: "stored@example.com", firstname: "Stored" }]));

      expect(() => validateUniqueEmail("new@example.com")).not.toThrow();

      if (originalValue) {
        localStorage.setItem("registeredUsers", originalValue);
      } else {
        localStorage.removeItem("registeredUsers");
      }
    });

    it("should handle empty users array gracefully", () => {
      expect(() => validateUniqueEmail("test@example.com", [])).not.toThrow();
    });

    it("should handle corrupted localStorage data gracefully", () => {
      const originalValue = localStorage.getItem("registeredUsers");

      localStorage.setItem("registeredUsers", "{invalid json}");

      expect(() => validateUniqueEmail("test@example.com")).not.toThrow();

      if (originalValue) {
        localStorage.setItem("registeredUsers", originalValue);
      } else {
        localStorage.removeItem("registeredUsers");
      }
    });
  });
});

/**
 * @function validateEmailComplete
 */
describe("validateEmailComplete - Combined email validation", () => {
  describe("Valid cases - Both format and uniqueness valid", () => {
    it("should accept valid and unique email", () => {
      const existingUsers = [{ email: "john@example.com", firstname: "John" }];
      expect(() => validateEmailComplete("new@example.com", existingUsers)).not.toThrow();
    });

    it("should accept well-formed unique email", () => {
      const existingUsers = [];
      expect(() => validateEmailComplete("user.name+tag@example.com", existingUsers)).not.toThrow();
    });
  });

  describe("Invalid cases - Format validation fails first", () => {
    it("should reject invalid format before checking uniqueness", () => {
      const existingUsers = [{ email: "john@example.com", firstname: "John" }];
      expect(() => validateEmailComplete("invalid-email", existingUsers)).toThrow(
        expect.objectContaining({
          code: "INVALID_EMAIL_FORMAT",
        }),
      );
    });

    it("should reject missing email", () => {
      const existingUsers = [];
      expect(() => validateEmailComplete("", existingUsers)).toThrow(
        expect.objectContaining({
          code: "MISSING_EMAIL",
        }),
      );
    });

    it("should reject email with spaces", () => {
      const existingUsers = [];
      expect(() => validateEmailComplete("user name@example.com", existingUsers)).toThrow();
    });
  });

  describe("Invalid cases - Format valid but not unique", () => {
    it("should reject duplicate email after format validation passes", () => {
      const existingUsers = [{ email: "john@example.com", firstname: "John" }];
      expect(() => validateEmailComplete("john@example.com", existingUsers)).toThrow(
        expect.objectContaining({
          code: "EMAIL_ALREADY_EXISTS",
        }),
      );
    });

    it("should reject duplicate email (case insensitive)", () => {
      const existingUsers = [{ email: "john@example.com", firstname: "John" }];
      expect(() => validateEmailComplete("JOHN@EXAMPLE.COM", existingUsers)).toThrow();
    });
  });

  describe("Combined validation order", () => {
    it("should throw format error before uniqueness error", () => {
      const existingUsers = [{ email: "john@example.com", firstname: "John" }];
      expect(() => validateEmailComplete("invalid", existingUsers)).toThrow(
        expect.objectContaining({
          code: "INVALID_EMAIL_FORMAT",
        }),
      );
    });
  });

  describe("Default parameter handling", () => {
    it("should read from localStorage when existingUsers is not provided", () => {
      const originalValue = localStorage.getItem("registeredUsers");

      localStorage.setItem("registeredUsers", JSON.stringify([{ email: "stored@example.com" }]));

      expect(() => validateEmailComplete("stored@example.com")).toThrow(
        expect.objectContaining({
          code: "EMAIL_ALREADY_EXISTS",
        }),
      );

      expect(() => validateEmailComplete("unique@example.com")).not.toThrow();

      if (originalValue) {
        localStorage.setItem("registeredUsers", originalValue);
      } else {
        localStorage.removeItem("registeredUsers");
      }
    });
  });
});
