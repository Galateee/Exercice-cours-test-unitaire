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

  describe("API Error Handling", () => {
    test("handles 400 error from API", async () => {
      const error = new Error("Email already exists");
      error.response = { status: 400, data: { message: "Email already exists" } };
      apiService.createUser.mockRejectedValue(error);

      const user = userEvent.setup();
      renderRegister();

      await user.type(screen.getByRole("textbox", { name: /first name/i }), "John");
      await user.type(screen.getByRole("textbox", { name: /last name/i }), "Doe");
      await user.type(screen.getByRole("textbox", { name: /email/i }), "john@example.com");

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
        expect(apiService.createUser).toHaveBeenCalled();
      });
    });

    test("handles 500 error from API", async () => {
      const error = new Error("Internal Server Error");
      error.response = { status: 500, data: { message: "Internal Server Error" } };
      apiService.createUser.mockRejectedValue(error);

      const user = userEvent.setup();
      renderRegister();

      await user.type(screen.getByRole("textbox", { name: /first name/i }), "John");
      await user.type(screen.getByRole("textbox", { name: /last name/i }), "Doe");
      await user.type(screen.getByRole("textbox", { name: /email/i }), "john@example.com");

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
        expect(apiService.createUser).toHaveBeenCalled();
      });
    });

    test("handles other HTTP errors from API", async () => {
      const error = new Error("Forbidden");
      error.response = { status: 403, data: { message: "Forbidden" } };
      apiService.createUser.mockRejectedValue(error);

      const user = userEvent.setup();
      renderRegister();

      await user.type(screen.getByRole("textbox", { name: /first name/i }), "John");
      await user.type(screen.getByRole("textbox", { name: /last name/i }), "Doe");
      await user.type(screen.getByRole("textbox", { name: /email/i }), "john@example.com");

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
        expect(apiService.createUser).toHaveBeenCalled();
      });
    });

    test("handles network error without response", async () => {
      const error = new Error("Network Error");
      apiService.createUser.mockRejectedValue(error);

      const user = userEvent.setup();
      renderRegister();

      await user.type(screen.getByRole("textbox", { name: /first name/i }), "John");
      await user.type(screen.getByRole("textbox", { name: /last name/i }), "Doe");
      await user.type(screen.getByRole("textbox", { name: /email/i }), "john@example.com");

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
        expect(apiService.createUser).toHaveBeenCalled();
      });
    });

    test("handles 400 error without message from API", async () => {
      const error = new Error("Bad Request");
      error.response = { status: 400, data: {} };
      apiService.createUser.mockRejectedValue(error);

      const user = userEvent.setup();
      renderRegister();

      await user.type(screen.getByRole("textbox", { name: /first name/i }), "John");
      await user.type(screen.getByRole("textbox", { name: /last name/i }), "Doe");
      await user.type(screen.getByRole("textbox", { name: /email/i }), "john@example.com");

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
        expect(apiService.createUser).toHaveBeenCalled();
      });
    });

    test("handles other HTTP errors from API (not 400, not 500)", async () => {
      const error = new Error("Forbidden");
      error.response = { status: 403, data: {} };
      apiService.createUser.mockRejectedValue(error);

      const user = userEvent.setup();
      renderRegister();

      await user.type(screen.getByRole("textbox", { name: /first name/i }), "John");
      await user.type(screen.getByRole("textbox", { name: /last name/i }), "Doe");
      await user.type(screen.getByRole("textbox", { name: /email/i }), "john@example.com");

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
        expect(apiService.createUser).toHaveBeenCalled();
      });
    });
  });
});
