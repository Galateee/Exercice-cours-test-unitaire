import { validateAge, validatePostalCode, validateIdentity, validateEmail } from "./validator";

let today;
beforeEach(() => {
  today = new Date();
});

/**
 * @function validateAge
 */
describe("validateAge - Age validation (>= 18 years)", () => {
  describe("Valid cases - Adults (>= 18 years)", () => {
    it("should accept a person exactly 18 years old", () => {
      const birthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

      expect(() => validateAge(birthDate)).not.toThrow();
    });

    it("should accept a 25-year-old person", () => {
      const birthDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());

      expect(() => validateAge(birthDate)).not.toThrow();
    });

    it("should accept a 65-year-old person", () => {
      const birthDate = new Date(today.getFullYear() - 65, today.getMonth(), today.getDate());

      expect(() => validateAge(birthDate)).not.toThrow();
    });
  });

  describe("Invalid cases - Minors (< 18 years)", () => {
    it("should reject a 17-year-old person", () => {
      const birthDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());

      expect(() => validateAge(birthDate)).toThrow();
    });

    it("should reject a person 17 years and 364 days old", () => {
      const birthDate = new Date(today);
      birthDate.setFullYear(birthDate.getFullYear() - 18);
      birthDate.setDate(birthDate.getDate() + 1);

      expect(() => validateAge(birthDate)).toThrow();
    });

    it("should reject a 10-year-old person", () => {
      const birthDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());

      expect(() => validateAge(birthDate)).toThrow();
    });

    it("should throw an exception with code AGE_TOO_YOUNG", () => {
      const birthDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());

      expect(() => validateAge(birthDate)).toThrow(
        expect.objectContaining({
          code: "AGE_TOO_YOUNG",
        }),
      );
    });

    it("should throw an exception with an explicit message", () => {
      const birthDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());

      expect(() => validateAge(birthDate)).toThrow(/at least 18 years old/i);
    });
  });

  describe("Edge cases and validation errors", () => {
    it("should reject an invalid birth date", () => {
      const invalidDate = new Date("invalid");

      expect(() => validateAge(invalidDate)).toThrow(
        expect.objectContaining({
          code: "INVALID_DATE",
        }),
      );
    });

    it("should reject a birth date in the future", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      expect(() => validateAge(futureDate)).toThrow(
        expect.objectContaining({
          code: "FUTURE_DATE",
        }),
      );
    });

    it("should reject if no date is provided", () => {
      expect(() => validateAge()).toThrow(
        expect.objectContaining({
          code: "MISSING_DATE",
        }),
      );
    });

    it("should reject if parameter is not a Date", () => {
      expect(() => validateAge("2000-01-01")).toThrow(
        expect.objectContaining({
          code: "INVALID_DATE_TYPE",
        }),
      );
    });

    it("should reject a person who is too old (> 150 years)", () => {
      const birthDate = new Date(today.getFullYear() - 151, today.getMonth(), today.getDate());

      expect(() => validateAge(birthDate)).toThrow(
        expect.objectContaining({
          code: "AGE_TOO_OLD",
        }),
      );
    });
  });

  describe("Precise age calculation", () => {
    it("should take into account the exact day to determine legal age", () => {
      const today = new Date(2026, 1, 6);
      const birthDate = new Date(2008, 1, 6);

      expect(() => validateAge(birthDate, today)).not.toThrow();
    });

    it("should reject if the 18th birthday is tomorrow", () => {
      const today = new Date(2026, 1, 6);
      const birthDate = new Date(2008, 1, 7);

      expect(() => validateAge(birthDate, today)).toThrow();
    });

    it("should calculate correctly with leap years", () => {
      const birthDate = new Date(2004, 1, 29);
      const checkDate = new Date(2022, 2, 1);

      expect(() => validateAge(birthDate, checkDate)).not.toThrow();
    });
  });
});

/**
 * @function validatePostalCode
 */
describe("validatePostalCode - French postal code validation (5 digits)", () => {
  describe("Valid cases - Correct French postal codes", () => {
    it("should accept a standard 5-digit postal code", () => {
      expect(() => validatePostalCode("75001")).not.toThrow();
    });

    it("should accept Paris postal codes (75xxx)", () => {
      expect(() => validatePostalCode("75008")).not.toThrow();
      expect(() => validatePostalCode("75116")).not.toThrow();
    });

    it("should accept Marseille postal code", () => {
      expect(() => validatePostalCode("13001")).not.toThrow();
    });

    it("should accept postal codes starting with 0", () => {
      expect(() => validatePostalCode("01000")).not.toThrow();
      expect(() => validatePostalCode("06000")).not.toThrow();
    });

    it("should accept postal codes with all same digits", () => {
      expect(() => validatePostalCode("11111")).not.toThrow();
      expect(() => validatePostalCode("99999")).not.toThrow();
    });
  });

  describe("Invalid cases - Incorrect formats", () => {
    it("should reject postal code with less than 5 digits", () => {
      expect(() => validatePostalCode("7500")).toThrow();
      expect(() => validatePostalCode("123")).toThrow();
      expect(() => validatePostalCode("1")).toThrow();
    });

    it("should reject postal code with more than 5 digits", () => {
      expect(() => validatePostalCode("750011")).toThrow();
      expect(() => validatePostalCode("1234567")).toThrow();
    });

    it("should reject postal code with letters", () => {
      expect(() => validatePostalCode("7500A")).toThrow();
      expect(() => validatePostalCode("ABC12")).toThrow();
      expect(() => validatePostalCode("75O01")).toThrow(); // O instead of 0
    });

    it("should reject postal code with special characters", () => {
      expect(() => validatePostalCode("75-001")).toThrow();
      expect(() => validatePostalCode("75 001")).toThrow();
      expect(() => validatePostalCode("75.001")).toThrow();
      expect(() => validatePostalCode("75_001")).toThrow();
    });

    it("should throw an exception with code INVALID_POSTAL_CODE_FORMAT", () => {
      expect(() => validatePostalCode("1234")).toThrow(
        expect.objectContaining({
          code: "INVALID_POSTAL_CODE_FORMAT",
        }),
      );
    });

    it("should throw an exception with an explicit message", () => {
      expect(() => validatePostalCode("ABC12")).toThrow(/5 digits/i);
    });
  });

  describe("Edge cases and validation errors", () => {
    it("should reject empty string", () => {
      expect(() => validatePostalCode("")).toThrow(
        expect.objectContaining({
          code: "MISSING_POSTAL_CODE",
        }),
      );
    });

    it("should reject null value", () => {
      expect(() => validatePostalCode(null)).toThrow(
        expect.objectContaining({
          code: "MISSING_POSTAL_CODE",
        }),
      );
    });

    it("should reject undefined value", () => {
      expect(() => validatePostalCode()).toThrow(
        expect.objectContaining({
          code: "MISSING_POSTAL_CODE",
        }),
      );
    });

    it("should reject non-string types - number", () => {
      expect(() => validatePostalCode(75001)).toThrow(
        expect.objectContaining({
          code: "INVALID_POSTAL_CODE_TYPE",
        }),
      );
    });

    it("should reject non-string types - object", () => {
      expect(() => validatePostalCode({ code: "75001" })).toThrow(
        expect.objectContaining({
          code: "INVALID_POSTAL_CODE_TYPE",
        }),
      );
    });

    it("should reject non-string types - array", () => {
      expect(() => validatePostalCode(["75001"])).toThrow(
        expect.objectContaining({
          code: "INVALID_POSTAL_CODE_TYPE",
        }),
      );
    });

    it("should reject postal code with only spaces", () => {
      expect(() => validatePostalCode("     ")).toThrow();
    });

    it("should reject postal code with leading/trailing spaces", () => {
      expect(() => validatePostalCode(" 75001")).toThrow();
      expect(() => validatePostalCode("75001 ")).toThrow();
      expect(() => validatePostalCode(" 75001 ")).toThrow();
    });

    it("should reject negative numbers as string", () => {
      expect(() => validatePostalCode("-7500")).toThrow();
    });

    it("should reject postal code with tab or newline", () => {
      expect(() => validatePostalCode("75\t001")).toThrow();
      expect(() => validatePostalCode("75\n001")).toThrow();
    });
  });
});

/**
 * @function validateIdentity
 */
describe("validateIdentity - Name/First name validation", () => {
  describe("Valid cases - Correct names", () => {
    it("should accept simple names", () => {
      expect(() => validateIdentity("Dupont")).not.toThrow();
      expect(() => validateIdentity("Martin")).not.toThrow();
    });

    it("should accept names with accents", () => {
      expect(() => validateIdentity("Léon")).not.toThrow();
      expect(() => validateIdentity("François")).not.toThrow();
      expect(() => validateIdentity("Hélène")).not.toThrow();
      expect(() => validateIdentity("André")).not.toThrow();
      expect(() => validateIdentity("José")).not.toThrow();
    });

    it("should accept names with hyphens", () => {
      expect(() => validateIdentity("Jean-Pierre")).not.toThrow();
      expect(() => validateIdentity("Marie-Claire")).not.toThrow();
      expect(() => validateIdentity("Anne-Sophie")).not.toThrow();
    });

    it("should accept names with both accents and hyphens", () => {
      expect(() => validateIdentity("François-René")).not.toThrow();
      expect(() => validateIdentity("Marie-Hélène")).not.toThrow();
    });

    it("should accept uppercase names", () => {
      expect(() => validateIdentity("DUPONT")).not.toThrow();
      expect(() => validateIdentity("MARTIN")).not.toThrow();
    });

    it("should accept mixed case names", () => {
      expect(() => validateIdentity("McDonald")).not.toThrow();
      expect(() => validateIdentity("O'Brien")).not.toThrow();
    });

    it("should accept names with apostrophes", () => {
      expect(() => validateIdentity("O'Connor")).not.toThrow();
      expect(() => validateIdentity("D'Angelo")).not.toThrow();
    });

    it("should accept names with spaces", () => {
      expect(() => validateIdentity("De La Cruz")).not.toThrow();
      expect(() => validateIdentity("Van Der Berg")).not.toThrow();
    });
  });

  describe("Invalid cases - Names with digits", () => {
    it("should reject names with numbers", () => {
      expect(() => validateIdentity("John123")).toThrow();
      expect(() => validateIdentity("Marie2")).toThrow();
      expect(() => validateIdentity("3Pierre")).toThrow();
    });

    it("should reject names with only numbers", () => {
      expect(() => validateIdentity("12345")).toThrow();
    });

    it("should throw an exception with code INVALID_IDENTITY_FORMAT for digits", () => {
      expect(() => validateIdentity("John123")).toThrow(
        expect.objectContaining({
          code: "INVALID_IDENTITY_FORMAT",
        }),
      );
    });
  });

  describe("Invalid cases - XSS injection protection", () => {
    it("should reject script tags", () => {
      expect(() => validateIdentity("<script>alert('XSS')</script>")).toThrow();
      expect(() => validateIdentity("<script>")).toThrow();
      expect(() => validateIdentity("</script>")).toThrow();
    });

    it("should reject other HTML tags", () => {
      expect(() => validateIdentity("<div>John</div>")).toThrow();
      expect(() => validateIdentity("<img src='x'>")).toThrow();
      expect(() => validateIdentity("<a href='x'>John</a>")).toThrow();
    });

    it("should reject inline JavaScript", () => {
      expect(() => validateIdentity("javascript:alert(1)")).toThrow();
      expect(() => validateIdentity("onclick=alert(1)")).toThrow();
    });

    it("should throw an exception with code XSS_DETECTED", () => {
      expect(() => validateIdentity("<script>")).toThrow(
        expect.objectContaining({
          code: "XSS_DETECTED",
        }),
      );
    });

    it("should throw an exception with XSS message", () => {
      expect(() => validateIdentity("<script>")).toThrow(/XSS|injection/i);
    });
  });

  describe("Invalid cases - Special characters", () => {
    it("should reject names with special characters", () => {
      expect(() => validateIdentity("John@Doe")).toThrow();
      expect(() => validateIdentity("Marie#")).toThrow();
      expect(() => validateIdentity("Pierre$")).toThrow();
      expect(() => validateIdentity("Jean%test")).toThrow();
    });

    it("should reject names with symbols", () => {
      expect(() => validateIdentity("Test&Name")).toThrow();
      expect(() => validateIdentity("Name*Test")).toThrow();
      expect(() => validateIdentity("Test+Name")).toThrow();
      expect(() => validateIdentity("Name=Test")).toThrow();
    });

    it("should reject names with brackets", () => {
      expect(() => validateIdentity("John[Doe]")).toThrow();
      expect(() => validateIdentity("Name{Test}")).toThrow();
      expect(() => validateIdentity("Test(Name)")).toThrow();
    });

    it("should throw an exception with code INVALID_IDENTITY_FORMAT for special chars", () => {
      expect(() => validateIdentity("John@Doe")).toThrow(
        expect.objectContaining({
          code: "INVALID_IDENTITY_FORMAT",
        }),
      );
    });
  });

  describe("Edge cases and validation errors", () => {
    it("should reject empty string", () => {
      expect(() => validateIdentity("")).toThrow(
        expect.objectContaining({
          code: "MISSING_IDENTITY",
        }),
      );
    });

    it("should reject null value", () => {
      expect(() => validateIdentity(null)).toThrow(
        expect.objectContaining({
          code: "MISSING_IDENTITY",
        }),
      );
    });

    it("should reject undefined value", () => {
      expect(() => validateIdentity()).toThrow(
        expect.objectContaining({
          code: "MISSING_IDENTITY",
        }),
      );
    });

    it("should reject non-string types - number", () => {
      expect(() => validateIdentity(123)).toThrow(
        expect.objectContaining({
          code: "INVALID_IDENTITY_TYPE",
        }),
      );
    });

    it("should reject non-string types - object", () => {
      expect(() => validateIdentity({ name: "John" })).toThrow(
        expect.objectContaining({
          code: "INVALID_IDENTITY_TYPE",
        }),
      );
    });

    it("should reject non-string types - array", () => {
      expect(() => validateIdentity(["John"])).toThrow(
        expect.objectContaining({
          code: "INVALID_IDENTITY_TYPE",
        }),
      );
    });

    it("should reject names with only spaces", () => {
      expect(() => validateIdentity("     ")).toThrow(
        expect.objectContaining({
          code: "MISSING_IDENTITY",
        }),
      );
    });

    it("should reject names that are too short (< 2 characters)", () => {
      expect(() => validateIdentity("A")).toThrow(
        expect.objectContaining({
          code: "IDENTITY_TOO_SHORT",
        }),
      );
    });

    it("should reject names that are too long (> 50 characters)", () => {
      const longName = "A".repeat(51);
      expect(() => validateIdentity(longName)).toThrow(
        expect.objectContaining({
          code: "IDENTITY_TOO_LONG",
        }),
      );
    });

    it("should reject leading/trailing whitespace", () => {
      expect(() => validateIdentity(" John")).toThrow();
      expect(() => validateIdentity("John ")).toThrow();
      expect(() => validateIdentity(" John ")).toThrow();
    });
  });
});

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
