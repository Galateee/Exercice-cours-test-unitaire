import validateAge from "./ageValidator";

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
