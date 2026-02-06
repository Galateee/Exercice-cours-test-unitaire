import { calculateAge } from "./module";

/**
 * @function calculateAge
 */

let people20years;
beforeEach(() => {
  let date = new Date();
  people20years = {
    birth: new Date(date.setFullYear(date.getFullYear() - 20)),
  };
});

describe("calculateAge Unit Test Suites", () => {
  it("should return a correct age", () => {
    expect(calculateAge(people20years)).toEqual(20);
  });

  it('should throw a "missing param p" error', () => {
    expect(() => calculateAge()).toThrow("missing param p");
  });

  it("should throw an error when the parameter is not an object", () => {
    expect(() => calculateAge("not an object")).toThrow();
    expect(() => calculateAge(123)).toThrow();
    expect(() => calculateAge(null)).toThrow();
  });

  it("should throw an error when the object does not contain a birth field", () => {
    const personWithoutBirth = { name: "John" };
    expect(() => calculateAge(personWithoutBirth)).toThrow();
  });

  it("should throw an error when the birth field is not a date", () => {
    const personWithInvalidBirth = { birth: "not a date" };
    expect(() => calculateAge(personWithInvalidBirth)).toThrow();
  });

  it("should throw an error when the birth date is invalid", () => {
    const personWithFalseBirth = { birth: new Date("invalid date") };
    expect(() => calculateAge(personWithFalseBirth)).toThrow();
  });

  it("should return the correct age even if run next year", () => {
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
    const person = { birth: birthDate };
    expect(calculateAge(person)).toEqual(25);
  });
});
