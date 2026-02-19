import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";
import { UserProvider } from "../contexts/UserContext";

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
  });

  test("renders back to home button", () => {
    renderRegister();
    const backButton = screen.getByRole("link", { name: /Back to Home/i });
    expect(backButton).toBeInTheDocument();
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
      expect(screen.getByText(/Formulaire soumis avec succès/i)).toBeInTheDocument();
    });

    const storedUsers = JSON.parse(localStorage.getItem("registeredUsers"));
    expect(storedUsers).toHaveLength(1);
    expect(storedUsers[0].firstName).toBe("John");
    expect(storedUsers[0].email).toBe("john.doe@example.com");
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

  test("displays error for duplicate email", async () => {
    const existingUser = {
      firstName: "Existing",
      lastName: "User",
      email: "existing@example.com",
      age: 30,
      postalCode: "69001",
      city: "Lyon",
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("registeredUsers", JSON.stringify([existingUser]));

    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByRole("textbox", { name: /first name/i }), "New");
    await user.type(screen.getByRole("textbox", { name: /last name/i }), "User");
    await user.type(screen.getByRole("textbox", { name: /email/i }), "existing@example.com");

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 25);
    const dateString = birthDate.toISOString().split("T")[0];
    await user.type(screen.getByLabelText(/birth date/i), dateString);

    await user.type(screen.getByRole("textbox", { name: /postal code/i }), "75001");
    await user.type(screen.getByRole("textbox", { name: /city/i }), "Paris");

    await waitFor(() => {
      expect(screen.getByText(/already registered/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });
});
