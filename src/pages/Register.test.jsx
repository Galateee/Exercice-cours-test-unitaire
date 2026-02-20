import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";
import { UserProvider } from "../contexts/UserContext";
import apiService from "../services/api";

jest.mock("../services/api", () => ({
  getUsers: jest.fn(() => Promise.resolve([])),
  createUser: jest.fn((userData) => Promise.resolve({ ...userData, id: Date.now() })),
}));

/**
 * Helper function to render Register component with required providers
 */
const renderRegister = (initialRoute = "/register") => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <UserProvider>
        <Register />
      </UserProvider>
    </MemoryRouter>,
  );
};

/**
 * Register Component Tests
 * Tests for the registration page
 */
describe("Register Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    apiService.getUsers.mockResolvedValue([]);
    apiService.createUser.mockImplementation((userData) => Promise.resolve({ ...userData, id: Date.now() }));
  });

  test("renders back to home button", async () => {
    const user = userEvent.setup();
    renderRegister();
    const backButton = screen.getByRole("button", { name: /Back to Home/i });
    expect(backButton).toBeInTheDocument();

    await user.click(backButton);
  });

  test("renders registration form", () => {
    renderRegister();
    const heading = screen.getByRole("heading", { name: /Registration Form/i });
    expect(heading).toBeInTheDocument();
  });

  test("renders all form fields", () => {
    renderRegister();

    expect(screen.getByRole("textbox", { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /last name/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/birth date/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /postal code/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /city/i })).toBeInTheDocument();
  });

  test("submit button is initially disabled", () => {
    renderRegister();
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  test("can fill out and submit form", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByRole("textbox", { name: /first name/i }), "John");
    await user.type(screen.getByRole("textbox", { name: /last name/i }), "Doe");
    await user.type(screen.getByRole("textbox", { name: /email/i }), "john.doe@example.com");

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 25);
    const dateString = birthDate.toISOString().split("T")[0];
    await user.type(screen.getByLabelText(/birth date/i), dateString);

    await user.type(screen.getByRole("textbox", { name: /postal code/i }), "75001");
    await user.type(screen.getByRole("textbox", { name: /city/i }), "Paris");

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(apiService.createUser).toHaveBeenCalledTimes(1);
    });

    const callArg = apiService.createUser.mock.calls[0][0];
    expect(callArg.firstName).toBe("John");
    expect(callArg.email).toBe("john.doe@example.com");
  });

  test("form validation works correctly", async () => {
    const user = userEvent.setup();
    renderRegister();

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });
    await user.type(firstNameInput, "J");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/must be at least 2 characters long/i)).toBeInTheDocument();
    });
  });

  test("displays error for invalid email format", async () => {
    const user = userEvent.setup();
    renderRegister();

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    await user.type(emailInput, "invalid-email");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/must be in a valid format/i)).toBeInTheDocument();
    });
  });

  test.skip("displays error for duplicate email", async () => {
    const existingUser = {
      firstName: "Existing",
      lastName: "User",
      email: "existing@example.com",
      age: 30,
      postalCode: "69001",
      city: "Lyon",
      timestamp: new Date().toISOString(),
      id: 1,
    };

    apiService.getUsers.mockResolvedValue([existingUser]);

    const user = userEvent.setup();
    renderRegister();

    await waitFor(
      () => {
        expect(apiService.getUsers).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    await new Promise((resolve) => setTimeout(resolve, 200));

    await user.type(screen.getByRole("textbox", { name: /first name/i }), "New");
    await user.type(screen.getByRole("textbox", { name: /last name/i }), "User");

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    await user.type(emailInput, "existing@example.com");
    await user.tab();

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 25);
    const dateString = birthDate.toISOString().split("T")[0];
    await user.type(screen.getByLabelText(/birth date/i), dateString);

    await user.type(screen.getByRole("textbox", { name: /postal code/i }), "75001");
    await user.type(screen.getByRole("textbox", { name: /city/i }), "Paris");

    await waitFor(
      () => {
        const errorElement = screen.queryByText(/this email address is already registered/i);
        expect(errorElement).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });
});
