import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "./Home";
import { UserProvider } from "../contexts/UserContext";

/**
 * Helper function to render Home component with required providers
 */
const renderHome = () => {
  return render(
    <BrowserRouter>
      <UserProvider>
        <Home />
      </UserProvider>
    </BrowserRouter>,
  );
};

/**
 * Home Component Tests
 * Tests for the home page displaying user list
 */
describe("Home Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders home page heading", () => {
    renderHome();
    const heading = screen.getByText(/Registered Users/i);
    expect(heading).toBeInTheDocument();
  });

  test("renders total users count", () => {
    renderHome();
    const totalText = screen.getByText(/Total users:/i);
    expect(totalText).toBeInTheDocument();
  });

  test("renders Register New User button", () => {
    renderHome();
    const button = screen.getByText(/Register New User/i);
    expect(button).toBeInTheDocument();
  });

  test("displays empty state when no users", () => {
    renderHome();
    const emptyMessage = screen.getByText(/No users registered yet/i);
    expect(emptyMessage).toBeInTheDocument();
  });

  test("displays user count as 0 when no users", () => {
    renderHome();
    const totalText = screen.getByText(/Total users:/i);
    expect(totalText).toHaveTextContent("0");
  });

  test("displays users list when users exist in localStorage", () => {
    const mockUsers = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        age: 25,
        postalCode: "75001",
        city: "Paris",
        timestamp: new Date().toISOString(),
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        age: 30,
        postalCode: "69001",
        city: "Lyon",
        timestamp: new Date().toISOString(),
      },
    ];

    localStorage.setItem("registeredUsers", JSON.stringify(mockUsers));

    renderHome();

    expect(screen.getByText(/Total users:/i)).toHaveTextContent("2");

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("75001")).toBeInTheDocument();

    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Smith")).toBeInTheDocument();
    expect(screen.getByText("jane.smith@example.com")).toBeInTheDocument();
    expect(screen.getByText("Lyon")).toBeInTheDocument();
    expect(screen.getByText("69001")).toBeInTheDocument();
  });

  test("does not display empty state when users exist", () => {
    const mockUsers = [
      {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        age: 20,
        postalCode: "33000",
        city: "Bordeaux",
        timestamp: new Date().toISOString(),
      },
    ];

    localStorage.setItem("registeredUsers", JSON.stringify(mockUsers));

    renderHome();

    expect(screen.queryByText(/No users registered yet/i)).not.toBeInTheDocument();
  });

  test("renders table headers when users exist", () => {
    const mockUsers = [
      {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        age: 20,
        postalCode: "33000",
        city: "Bordeaux",
        timestamp: new Date().toISOString(),
      },
    ];

    localStorage.setItem("registeredUsers", JSON.stringify(mockUsers));

    renderHome();

    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("Postal Code")).toBeInTheDocument();
    expect(screen.getByText("Registration Date")).toBeInTheDocument();
  });

  test("formats registration date correctly", () => {
    const timestamp = new Date("2024-01-15T10:30:00Z");
    const mockUsers = [
      {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        age: 20,
        postalCode: "33000",
        city: "Bordeaux",
        timestamp: timestamp.toISOString(),
      },
    ];

    localStorage.setItem("registeredUsers", JSON.stringify(mockUsers));

    renderHome();

    const formattedDate = timestamp.toLocaleDateString();
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  test("Register New User button links to /register", () => {
    renderHome();
    const link = screen.getByRole("link", { name: /Register New User/i });
    expect(link).toHaveAttribute("href", "/register");
  });
});
