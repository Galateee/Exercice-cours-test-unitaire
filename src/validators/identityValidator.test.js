import validateIdentity from "./identityValidator";

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
