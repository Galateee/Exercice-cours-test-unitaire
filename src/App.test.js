import { render, screen } from "@testing-library/react";
import App from "./App";

/**
 * App Component Tests
 * Tests for the main application routing and structure
 */
describe("App Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders home page with user list heading", () => {
    render(<App />);
    const heading = screen.getByText(/Registered Users/i);
    expect(heading).toBeInTheDocument();
  });

  test("renders Register New User button on home page", () => {
    render(<App />);
    const button = screen.getByText(/Register New User/i);
    expect(button).toBeInTheDocument();
  });

  test("displays empty state when no users registered", () => {
    render(<App />);
    const emptyMessage = screen.getByText(/No users registered yet/i);
    expect(emptyMessage).toBeInTheDocument();
  });

  test("displays total users count", () => {
    render(<App />);
    const totalText = screen.getByText(/Total users:/i);
    expect(totalText).toBeInTheDocument();
  });
});
