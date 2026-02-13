import validateUser from "./userValidator";

let today;
beforeEach(() => {
  today = new Date();
});

/**
 * @function validateUser
 */
describe("validateUser - Complete user form validation", () => {
  describe("Valid cases - Complete valid user data", () => {
    it("should return true for a valid user with all correct fields", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "jean.dupont@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(true);
    });

    it("should return true for a user with complex valid names", () => {
      const userData = {
        firstName: "Marie-Hélène",
        lastName: "O'Connor",
        birthDate: new Date(1985, 5, 15),
        email: "marie.oconnor@company.fr",
        postalCode: "13001",
      };

      expect(validateUser(userData)).toBe(true);
    });

    it("should return true for a user exactly 18 years old", () => {
      const birthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      const userData = {
        firstName: "Pierre",
        lastName: "Martin",
        birthDate: birthDate,
        email: "pierre.martin@test.com",
        postalCode: "06000",
      };

      expect(validateUser(userData)).toBe(true);
    });

    it("should return true for a senior user", () => {
      const userData = {
        firstName: "Jacques",
        lastName: "Durand",
        birthDate: new Date(1950, 3, 20),
        email: "jacques.durand@email.org",
        postalCode: "69001",
      };

      expect(validateUser(userData)).toBe(true);
    });

    it("should return true for users with different postal codes", () => {
      const userData1 = {
        firstName: "Sophie",
        lastName: "Bernard",
        birthDate: new Date(1995, 10, 5),
        email: "sophie@example.com",
        postalCode: "01000",
      };

      const userData2 = {
        firstName: "Luc",
        lastName: "Petit",
        birthDate: new Date(1988, 2, 12),
        email: "luc@example.com",
        postalCode: "99999",
      };

      expect(validateUser(userData1)).toBe(true);
      expect(validateUser(userData2)).toBe(true);
    });
  });

  describe("Invalid cases - Missing or null user data", () => {
    it("should return false when userData is null", () => {
      expect(validateUser(null)).toBe(false);
    });

    it("should return false when userData is undefined", () => {
      expect(validateUser(undefined)).toBe(false);
    });

    it("should return false when userData is not an object", () => {
      expect(validateUser("not an object")).toBe(false);
      expect(validateUser(123)).toBe(false);
      expect(validateUser(true)).toBe(false);
    });

    it("should return false when userData is an array", () => {
      expect(validateUser([])).toBe(false);
      expect(validateUser(["Jean", "Dupont"])).toBe(false);
    });

    it("should return false when userData is an empty object", () => {
      expect(validateUser({})).toBe(false);
    });
  });

  describe("Invalid cases - Invalid firstName", () => {
    it("should return false when firstName is missing", () => {
      const userData = {
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when firstName is empty", () => {
      const userData = {
        firstName: "",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when firstName is too short", () => {
      const userData = {
        firstName: "J",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when firstName contains numbers", () => {
      const userData = {
        firstName: "Jean123",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when firstName contains XSS attempt", () => {
      const userData = {
        firstName: "<script>alert('XSS')</script>",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });
  });

  describe("Invalid cases - Invalid lastName", () => {
    it("should return false when lastName is missing", () => {
      const userData = {
        firstName: "Jean",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when lastName is empty", () => {
      const userData = {
        firstName: "Jean",
        lastName: "",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when lastName contains special characters", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont@123",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });
  });

  describe("Invalid cases - Invalid birthDate", () => {
    it("should return false when birthDate is missing", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        email: "test@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when user is under 18", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(today.getFullYear() - 17, today.getMonth(), today.getDate()),
        email: "test@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when birthDate is in the future", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: futureDate,
        email: "test@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when birthDate is invalid", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date("invalid"),
        email: "test@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when birthDate is not a Date object", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: "1990-01-01",
        email: "test@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });
  });

  describe("Invalid cases - Invalid email", () => {
    it("should return false when email is missing", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when email is empty", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when email format is invalid", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "invalid-email",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when email has no @", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "testexample.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when email has XSS attempt", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "<script>@example.com",
        postalCode: "75001",
      };

      expect(validateUser(userData)).toBe(false);
    });
  });

  describe("Invalid cases - Invalid postalCode", () => {
    it("should return false when postalCode is missing", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when postalCode is empty", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: "",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when postalCode has wrong length", () => {
      const userData1 = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: "1234",
      };

      const userData2 = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: "123456",
      };

      expect(validateUser(userData1)).toBe(false);
      expect(validateUser(userData2)).toBe(false);
    });

    it("should return false when postalCode contains letters", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: "7500A",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when postalCode is not a string", () => {
      const userData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: 75001,
      };

      expect(validateUser(userData)).toBe(false);
    });
  });

  describe("Invalid cases - Multiple invalid fields", () => {
    it("should return false when multiple fields are invalid", () => {
      const userData = {
        firstName: "J",
        lastName: "D",
        birthDate: new Date(today.getFullYear() - 17, 0, 1),
        email: "invalid-email",
        postalCode: "123",
      };

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when all fields are missing", () => {
      const userData = {};

      expect(validateUser(userData)).toBe(false);
    });

    it("should return false when all fields are empty strings", () => {
      const userData = {
        firstName: "",
        lastName: "",
        birthDate: "",
        email: "",
        postalCode: "",
      };

      expect(validateUser(userData)).toBe(false);
    });
  });

  describe("Type checking and edge cases", () => {
    it("should return boolean type", () => {
      const validData = {
        firstName: "Jean",
        lastName: "Dupont",
        birthDate: new Date(1990, 0, 1),
        email: "test@example.com",
        postalCode: "75001",
      };

      const result = validateUser(validData);
      expect(typeof result).toBe("boolean");
    });

    it("should always return boolean, never throw exceptions", () => {
      const invalidData = {
        firstName: "<script>",
        lastName: null,
        birthDate: "invalid",
        email: 123,
        postalCode: [],
      };

      expect(() => validateUser(invalidData)).not.toThrow();
      expect(typeof validateUser(invalidData)).toBe("boolean");
    });

    it("should handle partial data gracefully", () => {
      const partialData = {
        firstName: "Jean",
        lastName: "Dupont",
      };

      expect(validateUser(partialData)).toBe(false);
    });
  });
});
