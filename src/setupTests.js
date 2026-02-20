// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

global.beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

global.afterEach(() => {
  if (console.error.mockRestore) {
    console.error.mockRestore();
  }
});
