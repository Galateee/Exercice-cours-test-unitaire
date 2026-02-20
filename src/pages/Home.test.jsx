import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter, __resetLocationState } from "react-router-dom";
import Home from "./Home";
import { UserProvider } from "../contexts/UserContext";
import { toast } from "react-toastify";
import apiService from "../services/api";

jest.mock("react-toastify", () => ({
  ToastContainer: () => null,
  toast: {
    success: jest.fn(),
  },
}));

jest.mock("../services/api");

/**
 * Helper function to render Home component with required providers
 */
const renderHome = (locationState = null) => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/", state: locationState }]}>
      <UserProvider>
        <Home />
      </UserProvider>
    </MemoryRouter>,
  );
};

/**
 * Home Component Tests
 * Tests for the home page displaying user list
 */
describe("Home Component", () => {
  beforeEach(() => {
    __resetLocationState();
    toast.success.mockClear();
    jest.clearAllMocks();
    apiService.getUsers.mockResolvedValue([]);
  });

  test("renders home page heading", async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText(/Registered Users/i)).toBeInTheDocument();
    });
  });

  test("renders total users count", async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText(/Total users:/i)).toBeInTheDocument();
    });
  });

  test("renders Register New User button", async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText(/Register New User/i)).toBeInTheDocument();
    });
  });

  test("displays empty state when no users", async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText(/No users registered yet/i)).toBeInTheDocument();
    });
  });

  test("displays user count as 0 when no users", async () => {
    renderHome();
    await waitFor(() => {
      const totalText = screen.getByText(/Total users:/i);
      expect(totalText).toHaveTextContent("0");
    });
  });

  test("displays users list when users exist in API", async () => {
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

    apiService.getUsers.mockResolvedValue(mockUsers);

    renderHome();

    await waitFor(() => {
      expect(screen.getByText(/Total users:/i)).toHaveTextContent("2");
    });

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

  test("does not display empty state when users exist", async () => {
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

    apiService.getUsers.mockResolvedValue(mockUsers);

    renderHome();

    await waitFor(() => {
      expect(screen.queryByText(/No users registered yet/i)).not.toBeInTheDocument();
    });
  });

  test("renders table headers when users exist", async () => {
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

    apiService.getUsers.mockResolvedValue(mockUsers);

    renderHome();

    await waitFor(() => {
      expect(screen.getByText("First Name")).toBeInTheDocument();
    });

    expect(screen.getByText("Last Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("Postal Code")).toBeInTheDocument();
    expect(screen.getByText("Registration Date")).toBeInTheDocument();
  });

  test("formats registration date correctly", async () => {
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

    apiService.getUsers.mockResolvedValue(mockUsers);

    renderHome();

    const formattedDate = timestamp.toLocaleDateString();
    await waitFor(() => {
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });
  });

  test("Register New User button links to /register", async () => {
    renderHome();
    await waitFor(() => {
      const link = screen.getByRole("link", { name: /Register New User/i });
      expect(link).toHaveAttribute("href", "/register");
    });
  });

  test("shows toast and highlights new user when redirected from registration", async () => {
    jest.useFakeTimers();

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
    ];

    apiService.getUsers.mockResolvedValue(mockUsers);

    renderHome({ newUserEmail: "john.doe@example.com" });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "User successfully registered!",
        expect.objectContaining({
          position: "top-right",
          autoClose: 3000,
        }),
      );
    });

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      const userRow = rows.find((row) => row.textContent.includes("john.doe@example.com"));
      expect(userRow).toHaveClass("new-user-highlight");
    });

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      const rowsAfter = screen.getAllByRole("row");
      const userRowAfter = rowsAfter.find((row) => row.textContent.includes("john.doe@example.com"));
      expect(userRowAfter).not.toHaveClass("new-user-highlight");
    });

    jest.useRealTimers();
  });
});
