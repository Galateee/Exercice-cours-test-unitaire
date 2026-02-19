import { render, screen, waitFor } from "@testing-library/react";
import { UserProvider, useUsers } from "./UserContext";

/**
 * Test component that uses UserContext
 */
function TestComponent() {
  const { users, addUser, refreshUsers } = useUsers();

  return (
    <div>
      <div data-testid="user-count">{users.length}</div>
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
 * UserContext Tests
 * Tests for the global user state management
 */
describe("UserContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("provides initial empty users array", () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    expect(screen.getByTestId("user-count")).toHaveTextContent("0");
  });

  test("loads users from localStorage on mount", () => {
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

    localStorage.setItem("registeredUsers", JSON.stringify(mockUsers));

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    expect(screen.getByTestId("user-count")).toHaveTextContent("1");
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  test("addUser adds a new user and saves to localStorage", async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    const addButton = screen.getByText("Add User");
    addButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("user-count")).toHaveTextContent("1");
    });

    expect(screen.getByText("test@example.com")).toBeInTheDocument();

    // Verify localStorage
    const storedUsers = JSON.parse(localStorage.getItem("registeredUsers"));
    expect(storedUsers).toHaveLength(1);
    expect(storedUsers[0].email).toBe("test@example.com");
  });

  test("refreshUsers reloads data from localStorage", async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    // Initially empty
    expect(screen.getByTestId("user-count")).toHaveTextContent("0");

    // Manually add data to localStorage (simulating external update)
    const newUser = {
      firstName: "External",
      lastName: "User",
      email: "external@example.com",
      age: 28,
      postalCode: "69001",
      city: "Lyon",
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("registeredUsers", JSON.stringify([newUser]));

    // Trigger refresh
    const refreshButton = screen.getByText("Refresh Users");
    refreshButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("user-count")).toHaveTextContent("1");
    });

    expect(screen.getByText("external@example.com")).toBeInTheDocument();
  });

  test("handles corrupted localStorage data gracefully", () => {
    localStorage.setItem("registeredUsers", "invalid-json");

    // Should not throw error
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    expect(screen.getByTestId("user-count")).toHaveTextContent("0");
  });

  test("handles missing localStorage data", () => {
    localStorage.removeItem("registeredUsers");

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    expect(screen.getByTestId("user-count")).toHaveTextContent("0");
  });

  test("throws error when useUsers is used outside UserProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    // Component that tries to use context outside provider
    function InvalidComponent() {
      useUsers();
      return <div>Test</div>;
    }

    expect(() => {
      render(<InvalidComponent />);
    }).toThrow("useUsers must be used within a UserProvider");

    consoleError.mockRestore();
  });

  test("addUser updates users state correctly with multiple users", async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    const addButton = screen.getByText("Add User");

    // Add first user
    addButton.click();
    await waitFor(() => {
      expect(screen.getByTestId("user-count")).toHaveTextContent("1");
    });

    // Add second user (need to modify TestComponent for this, or verify localStorage)
    const storedUsers = JSON.parse(localStorage.getItem("registeredUsers"));
    expect(storedUsers).toHaveLength(1);

    // Manually add another user to localStorage and refresh
    storedUsers.push({
      firstName: "Second",
      lastName: "User",
      email: "second@example.com",
      age: 30,
      postalCode: "69001",
      city: "Lyon",
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("registeredUsers", JSON.stringify(storedUsers));

    const refreshButton = screen.getByText("Refresh Users");
    refreshButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("user-count")).toHaveTextContent("2");
    });
  });
});
