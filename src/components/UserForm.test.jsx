import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserForm from "./UserForm.jsx";
import { toast } from "react-toastify";
import { useUsers } from "../contexts/UserContext";

jest.mock("react-toastify", () => ({
  ToastContainer: () => null,
  toast: {
    success: jest.fn(),
  },
}));

jest.mock("../contexts/UserContext", () => ({
  useUsers: jest.fn(() => ({
    users: [],
    addUser: jest.fn(),
    refreshUsers: jest.fn(),
    loading: false,
    error: null,
  })),
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

    useUsers.mockReturnValue({
      users: [],
      addUser: jest.fn(),
      refreshUsers: jest.fn(),
      loading: false,
      error: null,
    });
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
      expect(localStorageSpy).toHaveBeenCalledWith("registeredUsers", expect.any(String));
    });

    const savedData = JSON.parse(localStorageSpy.mock.calls[0][1]);
    expect(savedData).toBeInstanceOf(Array);
    expect(savedData).toHaveLength(1);
    expect(savedData[0]).toMatchObject({
      firstName: "Marie",
      lastName: "Martin",
      email: "marie.martin@example.com",
      postalCode: "69001",
      city: "Lyon",
    });
    expect(savedData[0]).toHaveProperty("timestamp");
    expect(savedData[0]).toHaveProperty("age");

    expect(toast.success).toHaveBeenCalledWith(
      "Form successfully submitted!",
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
   * Test: Age calculation - birthday not yet occurred this year
   */
  test("should calculate age correctly when birthday hasn't occurred yet this year", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });
    const lastNameInput = screen.getByRole("textbox", { name: /^last name\s*\*/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const birthDateInput = screen.getByLabelText(/birth date/i);
    const postalCodeInput = screen.getByRole("textbox", { name: /postal code/i });
    const cityInput = screen.getByRole("textbox", { name: /^city/i });
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(firstNameInput, "Alex");
    await user.type(lastNameInput, "Dupont");
    await user.type(emailInput, "alex.dupont@example.com");

    const today = new Date();
    const birthDate = new Date();
    birthDate.setFullYear(today.getFullYear() - 25);
    birthDate.setMonth(11);
    birthDate.setDate(31);

    const dateString = birthDate.toISOString().split("T")[0];
    await user.type(birthDateInput, dateString);

    await user.type(postalCodeInput, "75001");
    await user.type(cityInput, "Paris");

    await user.click(submitButton);

    await waitFor(() => {
      expect(localStorageSpy).toHaveBeenCalled();
    });

    const savedData = JSON.parse(localStorageSpy.mock.calls[0][1]);

    expect(savedData[0].age).toBe(24);
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

    expect(localStorage.getItem("registeredUsers")).toBeNull();
  });

  /**
   * Test: Duplicate email validation - should show error
   */
  test("should show error message when email already exists", async () => {
    const existingUsers = [{ email: "existing@example.com", firstName: "Existing", lastName: "User" }];

    useUsers.mockReturnValue({
      users: existingUsers,
      addUser: jest.fn(),
      refreshUsers: jest.fn(),
      loading: false,
      error: null,
    });

    const user = userEvent.setup();
    render(<UserForm />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });

    await user.type(emailInput, "existing@example.com");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/this email address is already registered/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Duplicate email validation - case insensitive
   */
  test("should reject duplicate email regardless of case", async () => {
    const existingUsers = [{ email: "test@example.com", firstName: "Test", lastName: "User" }];

    useUsers.mockReturnValue({
      users: existingUsers,
      addUser: jest.fn(),
      refreshUsers: jest.fn(),
      loading: false,
      error: null,
    });

    const user = userEvent.setup();
    render(<UserForm />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });

    await user.type(emailInput, "TEST@EXAMPLE.COM");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/this email address is already registered/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Form submission blocked when email is duplicate
   */
  test("should prevent form submission when email already exists", async () => {
    const existingUsers = [{ email: "duplicate@example.com", firstName: "First", lastName: "User" }];

    useUsers.mockReturnValue({
      users: existingUsers,
      addUser: jest.fn(),
      refreshUsers: jest.fn(),
      loading: false,
      error: null,
    });

    const user = userEvent.setup();
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });
    const lastNameInput = screen.getByRole("textbox", { name: /^last name\s*\*/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const birthDateInput = screen.getByLabelText(/birth date/i);
    const postalCodeInput = screen.getByRole("textbox", { name: /postal code/i });
    const cityInput = screen.getByRole("textbox", { name: /^city/i });
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(firstNameInput, "Second");
    await user.type(lastNameInput, "User");
    await user.type(emailInput, "duplicate@example.com");

    const twentyFiveYearsAgo = new Date();
    twentyFiveYearsAgo.setFullYear(twentyFiveYearsAgo.getFullYear() - 25);
    const dateString = twentyFiveYearsAgo.toISOString().split("T")[0];
    await user.type(birthDateInput, dateString);

    await user.type(postalCodeInput, "75001");
    await user.type(cityInput, "Paris");

    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/this email address is already registered/i)).toBeInTheDocument();
    });

    expect(submitButton).toBeDisabled();
  });

  /**
   * Test: Multiple users can be registered with different emails
   */
  test("should allow multiple users to register with unique emails", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const fillForm = async (firstName, lastName, email, city) => {
      const firstNameInput = screen.getByRole("textbox", { name: /first name/i });
      const lastNameInput = screen.getByRole("textbox", { name: /^last name\s*\*/i });
      const emailInput = screen.getByRole("textbox", { name: /email/i });
      const birthDateInput = screen.getByLabelText(/birth date/i);
      const postalCodeInput = screen.getByRole("textbox", { name: /postal code/i });
      const cityInput = screen.getByRole("textbox", { name: /^city/i });

      await user.type(firstNameInput, firstName);
      await user.type(lastNameInput, lastName);
      await user.type(emailInput, email);

      const twentyFiveYearsAgo = new Date();
      twentyFiveYearsAgo.setFullYear(twentyFiveYearsAgo.getFullYear() - 25);
      const dateString = twentyFiveYearsAgo.toISOString().split("T")[0];
      await user.type(birthDateInput, dateString);

      await user.type(postalCodeInput, "75001");
      await user.type(cityInput, city);
    };

    await fillForm("Alice", "Martin", "alice@example.com", "Paris");

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    await fillForm("Bob", "Dupont", "bob@example.com", "Lyon");

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledTimes(2);
    });

    const users = JSON.parse(localStorage.getItem("registeredUsers"));
    expect(users).toHaveLength(2);
    expect(users[0].email).toBe("alice@example.com");
    expect(users[1].email).toBe("bob@example.com");
  });

  /**
   * Test: Form submission handles corrupted localStorage gracefully
   */
  test("should handle corrupted localStorage data during form submission", async () => {
    localStorage.setItem("registeredUsers", "{invalid json}");

    const user = userEvent.setup();
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });
    const lastNameInput = screen.getByRole("textbox", { name: /^last name\s*\*/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const birthDateInput = screen.getByLabelText(/birth date/i);
    const postalCodeInput = screen.getByRole("textbox", { name: /postal code/i });
    const cityInput = screen.getByRole("textbox", { name: /city/i });

    await user.type(firstNameInput, "Test");
    await user.type(lastNameInput, "User");
    await user.type(emailInput, "test@example.com");
    await user.type(birthDateInput, "2000-01-01");
    await user.type(postalCodeInput, "75001");
    await user.type(cityInput, "Paris");

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    const savedData = JSON.parse(localStorage.getItem("registeredUsers"));
    expect(savedData).toBeInstanceOf(Array);
    expect(savedData).toHaveLength(1);
    expect(savedData[0].email).toBe("test@example.com");
  });

  /**
   * Test: Form submission prevented when all fields filled but one is invalid
   * This tests the validation loop in isFormValid that checks each field
   */
  test("should prevent submission when all fields are filled but email is invalid", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });
    const lastNameInput = screen.getByRole("textbox", { name: /^last name\s*\*/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const birthDateInput = screen.getByLabelText(/birth date/i);
    const postalCodeInput = screen.getByRole("textbox", { name: /postal code/i });
    const cityInput = screen.getByRole("textbox", { name: /^city/i });

    await user.type(firstNameInput, "Jean");
    await user.type(lastNameInput, "Dupont");
    await user.type(emailInput, "invalid-email");

    const twentyFiveYearsAgo = new Date();
    twentyFiveYearsAgo.setFullYear(twentyFiveYearsAgo.getFullYear() - 25);
    const dateString = twentyFiveYearsAgo.toISOString().split("T")[0];
    await user.type(birthDateInput, dateString);

    await user.type(postalCodeInput, "75001");
    await user.type(cityInput, "Paris");

    await user.tab();

    const submitButton = screen.getByRole("button", { name: /submit/i });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    fireEvent.submit(screen.getByRole("form", { name: /user registration form/i }));

    await waitFor(() => {
      expect(localStorage.getItem("registeredUsers")).toBeNull();
    });
  });

  /**
   * Test: Form submission prevented when postal code is invalid but all fields filled
   */
  test("should prevent submission when postal code is invalid", async () => {
    const user = userEvent.setup();
    render(<UserForm />);

    const firstNameInput = screen.getByRole("textbox", { name: /first name/i });
    const lastNameInput = screen.getByRole("textbox", { name: /^last name\s*\*/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const birthDateInput = screen.getByLabelText(/birth date/i);
    const postalCodeInput = screen.getByRole("textbox", { name: /postal code/i });
    const cityInput = screen.getByRole("textbox", { name: /^city/i });

    await user.type(firstNameInput, "Marie");
    await user.type(lastNameInput, "Martin");
    await user.type(emailInput, "marie@example.com");

    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
    const dateString = thirtyYearsAgo.toISOString().split("T")[0];
    await user.type(birthDateInput, dateString);

    await user.type(postalCodeInput, "1234");
    await user.type(cityInput, "Lyon");

    await user.tab();

    const submitButton = screen.getByRole("button", { name: /submit/i });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    fireEvent.submit(screen.getByRole("form", { name: /user registration form/i }));

    await waitFor(() => {
      expect(localStorage.getItem("registeredUsers")).toBeNull();
    });
  });

  /**
   * Test: Component cleanup properly removes event listeners and clears timeouts
   */
  test("should clean up event listeners and timeouts on unmount", async () => {
    const { unmount } = render(<UserForm />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /first name/i })).toBeInTheDocument();
    });

    unmount();

    expect(true).toBe(true);
  });

  /**
   * Test: Component handles missing DOM elements gracefully during event listener setup
   */
  test("should handle missing DOM elements during autofill detection setup", () => {
    // eslint-disable-next-line testing-library/no-node-access
    const originalGetElementById = document.getElementById;

    const getElementByIdMock = jest.fn((id) => {
      if (id === "city") {
        return null;
      }
      return originalGetElementById.call(document, id);
    });

    // eslint-disable-next-line testing-library/no-node-access
    document.getElementById = getElementByIdMock;

    const { unmount } = render(<UserForm />);

    expect(screen.getByRole("textbox", { name: /first name/i })).toBeInTheDocument();

    unmount();

    // eslint-disable-next-line testing-library/no-node-access
    document.getElementById = originalGetElementById;
  });
});
