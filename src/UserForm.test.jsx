import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserForm from "./UserForm.jsx";
import { toast } from "react-toastify";

jest.mock("react-toastify", () => ({
  ToastContainer: () => null,
  toast: {
    success: jest.fn(),
  },
}));

/**
 * Integration tests for UserForm component
 * These tests verify the complete behavior of the form including:
 * - DOM rendering
 * - User interactions
 * - Validation feedback
 * - Form submission
 * - localStorage integration
 */
describe("UserForm - Integration Tests", () => {
  let localStorageSpy;

  beforeEach(() => {
    localStorage.clear();

    localStorageSpy = jest.spyOn(Storage.prototype, "setItem");

    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorageSpy.mockRestore();
  });

  /**
   * Test: Form renders with all required fields
   */
  test("should render all form fields with labels", () => {
    render(<UserForm />);

    expect(screen.getByRole("textbox", { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^last name\s*\*/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/birth date/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /postal code/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^city/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  /**
   * Test: Submit button is initially disabled
   */
  test("should have submit button disabled initially", () => {
    render(<UserForm />);

    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  /**
   * Test: Error messages appear on invalid input after blur
   */
  test("should show error message when firstName is invalid on blur", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });

    await user.type(firstNameInput, "A");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/must be at least 2 characters long/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Error message appears for invalid lastName
   */
  test("should show error message when lastName contains numbers", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const lastNameInput = screen.getByRole("textbox", { name: /^last name\s*\*/i });

    await user.type(lastNameInput, "Smith123");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/can only contain letters.*no digits/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Error message appears for invalid email format
   */
  test("should show error message when email is invalid", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });

    await user.type(emailInput, "invalid-email");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/must be in a valid format.*example@domain/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Error message appears for underage user
   */
  test("should show error message when user is under 18", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const birthDateInput = screen.getByLabelText(/birth date/i);

    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    const dateString = tenYearsAgo.toISOString().split("T")[0];

    await user.type(birthDateInput, dateString);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/you must be at least 18 years old/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Error message appears for invalid postal code
   */
  test("should show error message when postal code is invalid", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const postalCodeInput = screen.getByRole("textbox", { name: /postal code/i });

    await user.type(postalCodeInput, "123");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/must be exactly 5 digits/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Simulating a "chaotic user" - invalid inputs, corrections, re-entry
   */
  test("should handle chaotic user behavior: invalid inputs, corrections, and re-entry", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const postalCodeInput = screen.getByRole("textbox", { name: /postal code/i });
    const submitButton = screen.getByRole("button", { name: /submit/i });

    expect(submitButton).toBeDisabled();

    await user.type(firstNameInput, "A");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/must be at least 2 characters long/i)).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();

    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jean");
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(/must be at least 2 characters long/i)).not.toBeInTheDocument();
    });

    await user.type(emailInput, "bad-email");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/must be in a valid format.*example@domain/i)).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();

    await user.clear(emailInput);
    await user.type(emailInput, "jean@example.com");
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(/must be in a valid format/i)).not.toBeInTheDocument();
    });

    await user.type(postalCodeInput, "ABCDE");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/must be exactly 5 digits/i)).toBeInTheDocument();
    });

    await user.clear(postalCodeInput);
    await user.type(postalCodeInput, "75001");
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(/must be exactly 5 digits/i)).not.toBeInTheDocument();
    });

    expect(submitButton).toBeDisabled();
  });

  /**
   * Test: Submit button becomes enabled when all fields are valid
   */
  test("should enable submit button when all fields are valid", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });
    const lastNameInput = screen.getByRole("textbox", { name: /^last name\s*\*/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const birthDateInput = screen.getByLabelText(/birth date/i);
    const postalCodeInput = screen.getByRole("textbox", { name: /postal code/i });
    const cityInput = screen.getByRole("textbox", { name: /^city/i });
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(firstNameInput, "Jean");
    await user.type(lastNameInput, "Dupont");
    await user.type(emailInput, "jean.dupont@example.com");

    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
    const dateString = thirtyYearsAgo.toISOString().split("T")[0];
    await user.type(birthDateInput, dateString);

    await user.type(postalCodeInput, "75001");
    await user.type(cityInput, "Paris");

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
  });

  /**
   * Test: Form submission - localStorage spy, toast notification, form reset
   */
  test("should save to localStorage, show toast, and clear form on successful submit", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });
    const lastNameInput = screen.getByRole("textbox", { name: /^last name\s*\*/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const birthDateInput = screen.getByLabelText(/birth date/i);
    const postalCodeInput = screen.getByRole("textbox", { name: /postal code/i });
    const cityInput = screen.getByRole("textbox", { name: /^city/i });
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(firstNameInput, "Marie");
    await user.type(lastNameInput, "Martin");
    await user.type(emailInput, "marie.martin@example.com");

    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
    const dateString = thirtyYearsAgo.toISOString().split("T")[0];
    await user.type(birthDateInput, dateString);

    await user.type(postalCodeInput, "69001");
    await user.type(cityInput, "Lyon");

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(localStorageSpy).toHaveBeenCalledWith("userData", expect.any(String));
    });

    const savedData = JSON.parse(localStorageSpy.mock.calls[0][1]);
    expect(savedData).toMatchObject({
      firstName: "Marie",
      lastName: "Martin",
      email: "marie.martin@example.com",
      birthDate: dateString,
      postalCode: "69001",
      city: "Lyon",
    });
    expect(savedData).toHaveProperty("timestamp");

    expect(toast.success).toHaveBeenCalledWith(
      "Formulaire soumis avec succès !",
      expect.objectContaining({
        position: "top-right",
        autoClose: 3000,
      }),
    );

    expect(firstNameInput).toHaveValue("");
    expect(lastNameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");
    expect(birthDateInput).toHaveValue("");
    expect(postalCodeInput).toHaveValue("");
    expect(cityInput).toHaveValue("");

    expect(submitButton).toBeDisabled();
  });

  /**
   * Test: XSS protection - form should show error for malicious input
   */
  test("should detect and prevent XSS attacks in firstName", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });

    await user.type(firstNameInput, '<script>alert("xss")</script>');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/potential xss injection detected/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Error disappears when corrected
   */
  test("should remove error message when field is corrected", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });

    await user.type(emailInput, "invalid");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/must be in a valid format.*example@domain/i)).toBeInTheDocument();
    });

    await user.clear(emailInput);
    await user.type(emailInput, "valid@example.com");
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(/must be in a valid format/i)).not.toBeInTheDocument();
    });
  });

  /**
   * Test: Multiple validation errors can appear simultaneously
   */
  test("should display multiple validation errors simultaneously", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const postalCodeInput = screen.getByRole("textbox", { name: /postal code/i });

    await user.type(firstNameInput, "A");
    await user.tab();

    await user.type(emailInput, "bad");
    await user.tab();

    await user.type(postalCodeInput, "12");
    await user.tab();

    expect(screen.getByText(/must be at least 2 characters long/i)).toBeInTheDocument();
    expect(screen.getByText(/must be in a valid format.*example@domain/i)).toBeInTheDocument();
    expect(screen.getByText(/must be exactly 5 digits/i)).toBeInTheDocument();
  });

  /**
   * Test: Submit button stays disabled with partially filled form
   */
  test("should keep submit button disabled when only some fields are filled", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(firstNameInput, "Jean");
    await user.type(emailInput, "jean@example.com");

    expect(submitButton).toBeDisabled();
  });

  /**
   * Test: Edge case - exactly 18 years old should be valid
   */
  test("should accept user who is exactly 18 years old today", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const birthDateInput = screen.getByLabelText(/birth date/i);

    const exactlyEighteen = new Date();
    exactlyEighteen.setFullYear(exactlyEighteen.getFullYear() - 18);
    const dateString = exactlyEighteen.toISOString().split("T")[0];

    await user.type(birthDateInput, dateString);
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(/you must be at least 18 years old/i)).not.toBeInTheDocument();
    });
  });

  /**
   * Test: Form validation on real-time typing after initial blur
   */
  test("should validate in real-time after field has been touched", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });

    await user.type(firstNameInput, "A");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/must be at least 2 characters long/i)).toBeInTheDocument();
    });

    await user.click(firstNameInput);
    await user.type(firstNameInput, "nne");

    await waitFor(() => {
      expect(screen.queryByText(/must be at least 2 characters long/i)).not.toBeInTheDocument();
    });

    expect(firstNameInput).toHaveValue("Anne");
  });

  /**
   * Test: Edge case - future birth date should be invalid
   */
  test("should reject future birth dates", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const birthDateInput = screen.getByLabelText(/birth date/i);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0];

    await user.type(birthDateInput, dateString);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/birth date cannot be in the future/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Edge case - postal code starting with 0 should be valid
   */
  test("should accept postal codes starting with 0", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const postalCodeInput = screen.getByRole("textbox", { name: /postal code/i });

    await user.type(postalCodeInput, "01000");
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(/must be exactly 5 digits/i)).not.toBeInTheDocument();
    });

    expect(postalCodeInput).toHaveValue("01000");
  });

  /**
   * Test: Edge case - city with numbers or special characters should be invalid
   */
  test("should show error when city contains numbers or special characters", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const cityInput = screen.getByRole("textbox", { name: /^city/i });

    await user.type(cityInput, "Paris123");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/can only contain letters.*no digits/i)).toBeInTheDocument();
    });

    await user.clear(cityInput);
    await user.type(cityInput, "Paris@#$");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/can only contain letters.*no digits/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Edge case - unrealistic age (over 120 years old) should be invalid
   */
  test("should reject birth date older than 120 years", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const birthDateInput = screen.getByLabelText(/birth date/i);

    const tooOld = new Date();
    tooOld.setFullYear(tooOld.getFullYear() - 151);
    const dateString = tooOld.toISOString().split("T")[0];

    await user.type(birthDateInput, dateString);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/calculated age is unrealistic.*over 150 years/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Attempting to submit invalid form does nothing
   */
  test("should not submit form when data is invalid", async () => {
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });
    const form = screen.getByRole("form", { name: /user registration form/i });

    fireEvent.change(firstNameInput, { target: { name: "firstName", value: "John" } });

    fireEvent.submit(form);

    expect(localStorage.getItem("userData")).toBeNull();
  });
});
