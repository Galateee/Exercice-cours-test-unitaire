import validatePostalCode from "./postalCodeValidator";

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
