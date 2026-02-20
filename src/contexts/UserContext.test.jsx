import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { UserProvider, useUsers } from "./UserContext";
import apiService from "../services/api";

jest.mock("../services/api");

/**
 * Test component that uses UserContext
 */
function TestComponent() {
  const { users, addUser, refreshUsers, loading, error } = useUsers();

  return (
    <div>
      <div data-testid="user-count">{users.length}</div>
      <div data-testid="loading">{loading ? "Loading..." : "Not loading"}</div>
      <div data-testid="error">{error || "No error"}</div>
      <button
        onClick={() =>
          addUser({
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
            age: 25,
            postalCode: "75001",
            city: "Paris",
            timestamp: new Date().toISOString(),
          })
        }>
        Add User
      </button>
      <button onClick={refreshUsers}>Refresh Users</button>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user.email}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Test component that catches addUser errors
 */
function TestComponentWithErrorHandling() {
  const { users, addUser, refreshUsers, loading, error } = useUsers();

  const handleAddUser = async () => {
    try {
      await addUser({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        age: 25,
        postalCode: "75001",
        city: "Paris",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {}
  };

  return (
    <div>
      <div data-testid="user-count">{users.length}</div>
      <div data-testid="loading">{loading ? "Loading..." : "Not loading"}</div>
      <div data-testid="error">{error || "No error"}</div>
      <button onClick={handleAddUser}>Add User With Handling</button>
      <button onClick={refreshUsers}>Refresh Users</button>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user.email}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * UserContext Tests
 * Tests for the global user state management with API integration
 */
describe("UserContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiService.getUsers.mockResolvedValue([]);
  });

  test("provides initial empty users array when API returns empty", async () => {
    apiService.getUsers.mockResolvedValue([]);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not loading");
    });

    expect(screen.getByTestId("user-count")).toHaveTextContent("0");
    expect(apiService.getUsers).toHaveBeenCalledTimes(1);
  });

  test("loads users from API on mount", async () => {
    const mockUsers = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        age: 30,
        postalCode: "75001",
        city: "Paris",
        timestamp: new Date().toISOString(),
      },
    ];

    apiService.getUsers.mockResolvedValue(mockUsers);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-count")).toHaveTextContent("1");
    });

    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(apiService.getUsers).toHaveBeenCalledTimes(1);
  });

  test("addUser creates a new user via API", async () => {
    const newUser = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      age: 25,
      postalCode: "75001",
      city: "Paris",
      timestamp: expect.any(String),
    };

    const createdUser = { ...newUser, id: 101 };
    apiService.getUsers.mockResolvedValue([]);
    apiService.createUser.mockResolvedValue(createdUser);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not loading");
    });

    const addButton = screen.getByText("Add User");
    addButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("user-count")).toHaveTextContent("1");
    });

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(apiService.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      }),
    );
  });

  test("refreshUsers reloads data from API", async () => {
    apiService.getUsers.mockResolvedValueOnce([]);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-count")).toHaveTextContent("0");
    });

    const newUser = {
      firstName: "External",
      lastName: "User",
      email: "external@example.com",
      age: 28,
      postalCode: "69001",
      city: "Lyon",
      timestamp: new Date().toISOString(),
    };
    apiService.getUsers.mockResolvedValueOnce([newUser]);

    const refreshButton = screen.getByText("Refresh Users");
    refreshButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("user-count")).toHaveTextContent("1");
    });

    expect(screen.getByText("external@example.com")).toBeInTheDocument();
    expect(apiService.getUsers).toHaveBeenCalledTimes(2);
  });

  test("handles API errors gracefully", async () => {
    const apiError = new Error("Network Error");
    apiService.getUsers.mockRejectedValue(apiError);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not loading");
    });

    expect(screen.getByTestId("user-count")).toHaveTextContent("0");
    expect(screen.getByTestId("error")).not.toHaveTextContent("No error");
  });

  test("handles missing API data (empty response)", async () => {
    apiService.getUsers.mockResolvedValue([]);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not loading");
    });

    expect(screen.getByTestId("user-count")).toHaveTextContent("0");
    expect(screen.getByTestId("error")).toHaveTextContent("No error");
  });

  test("throws error when useUsers is used outside UserProvider", () => {
    function InvalidComponent() {
      useUsers();
      return <div>Test</div>;
    }

    expect(() => {
      render(<InvalidComponent />);
    }).toThrow("useUsers must be used within a UserProvider");
  });

  test("addUser and refresh work together correctly", async () => {
    const firstUser = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      age: 25,
      postalCode: "75001",
      city: "Paris",
      timestamp: expect.any(String),
    };

    const secondUser = {
      firstName: "Second",
      lastName: "User",
      email: "second@example.com",
      age: 30,
      postalCode: "69001",
      city: "Lyon",
      timestamp: new Date().toISOString(),
    };

    apiService.getUsers.mockResolvedValueOnce([]);
    apiService.createUser.mockResolvedValue({ ...firstUser, id: 101 });
    apiService.getUsers.mockResolvedValueOnce([
      { ...firstUser, id: 101 },
      { ...secondUser, id: 102 },
    ]);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-count")).toHaveTextContent("0");
    });

    const addButton = screen.getByText("Add User");
    addButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("user-count")).toHaveTextContent("1");
    });

    const refreshButton = screen.getByText("Refresh Users");
    refreshButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("user-count")).toHaveTextContent("2");
    });

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("second@example.com")).toBeInTheDocument();
  });

  test("handles API error without message in loadUsers", async () => {
    const apiError = {};
    apiService.getUsers.mockRejectedValue(apiError);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not loading");
    });

    expect(screen.getByTestId("user-count")).toHaveTextContent("0");
    expect(screen.getByTestId("error")).toHaveTextContent("Failed to load users");
  });

  test("handles API error without message in addUser", async () => {
    const apiError = {};

    apiService.getUsers.mockResolvedValue([]);
    apiService.createUser.mockRejectedValue(apiError);

    render(
      <UserProvider>
        <TestComponentWithErrorHandling />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not loading");
    });

    const addButton = screen.getByText("Add User With Handling");

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Failed to create user");
    });
  });
});
