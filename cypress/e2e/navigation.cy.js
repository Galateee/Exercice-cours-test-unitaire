/* global cy, Cypress */

/**
 * E2E Tests for Navigation between pages
 * Tests the routing and navigation flow of the application with API integration
 */

/**
 * Transform application user format to JSONPlaceholder format for mocking
 * @param {Object} appUser - User in application format
 * @returns {Object} User in JSONPlaceholder format
 */
function transformUserToApiFormat(appUser) {
  return {
    id: appUser.id,
    name: `${appUser.firstName} ${appUser.lastName}`,
    username: appUser.firstName.toLowerCase(),
    email: appUser.email,
    address: {
      street: "Mock Street",
      suite: "Suite 123",
      city: appUser.city,
      zipcode: appUser.postalCode,
      geo: { lat: "0.0", lng: "0.0" },
    },
    phone: "000-000-0000",
    website: "example.com",
    company: {
      name: "Mock Company",
      catchPhrase: "Mock catchphrase",
      bs: "mock bs",
    },
  };
}

/**
 * Helper to setup API intercepts for user management
 * @param {Array} existingUsers - Array of users in application format (will be transformed to JSONPlaceholder format)
 */
function setupApiIntercepts(existingUsers = []) {
  const apiFormatUsers = existingUsers.map(transformUserToApiFormat);

  cy.intercept("GET", "https://jsonplaceholder.typicode.com/users", {
    statusCode: 200,
    body: apiFormatUsers,
  }).as("getUsers");

  cy.intercept("POST", "https://jsonplaceholder.typicode.com/users", (req) => {
    const newUser = { ...req.body, id: Date.now() };
    req.reply({
      statusCode: 201,
      body: newUser,
    });
  }).as("createUser");
}

/**
 * Nominal Scenario - Navigation and new user registration
 */
describe("Nominal Scenario - Navigation and registration", () => {
  beforeEach(() => {
    setupApiIntercepts([]);
  });

  it("should allow user registration and see counter and list update", () => {
    // 1. Navigate to Home → Verify "0 users registered" and empty list
    cy.visit("/");
    cy.wait("@getUsers");
    cy.get("[data-cy='home-page']").should("be.visible");
    cy.get("[data-cy='user-count-value']").should("contain", "0");
    cy.get("[data-cy='empty-state']").should("be.visible");
    cy.get("[data-cy='users-list']").should("not.exist");

    // 2. Click/Navigate to the Form (/register)
    cy.get("[data-cy='register-button']").click();
    cy.url().should("include", "/register");
    cy.get("[data-cy='register-page']").should("be.visible");
    cy.get("[data-cy='form-title']").should("contain", "Registration Form");

    // 3. Add a new valid user (Success)
    cy.get("[data-cy='input-firstName']").type("Jean");
    cy.get("[data-cy='input-lastName']").type("Dupont");
    cy.get("[data-cy='input-email']").type("jean.dupont@example.com");

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 30);
    const dateString = birthDate.toISOString().split("T")[0];
    cy.get("[data-cy='input-birthDate']").type(dateString);

    cy.get("[data-cy='input-postalCode']").type("75001");
    cy.get("[data-cy='input-city']").type("Paris");

    cy.get("[data-cy='submit-button']").should("not.be.disabled");

    cy.get("[data-cy='submit-button']").click();
    cy.wait("@createUser");

    // 4. Redirect to Home - data is already in React state
    cy.url().should("not.include", "/register");
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // 5. Verify "1 user registered" AND the presence of the new user in the list
    cy.get("[data-cy='user-count-value']").should("contain", "1");
    cy.get("[data-cy='users-list']").should("be.visible");
    cy.get("[data-cy='users-table']").should("be.visible");
    cy.get("[data-cy='users-tbody']").within(() => {
      cy.contains("Jean").should("be.visible");
      cy.contains("Dupont").should("be.visible");
      cy.contains("jean.dupont@example.com").should("be.visible");
      cy.contains("Paris").should("be.visible");
    });
    cy.get("[data-cy='empty-state']").should("not.exist");
  });
});

/**
 * Error Scenario - Invalid submission attempt with unchanged state
 */
describe("Error Scenario - Validation and unchanged state", () => {
  beforeEach(() => {
    const existingUser = {
      firstName: "Marie",
      lastName: "Martin",
      email: "marie.martin@example.com",
      age: 28,
      postalCode: "69001",
      city: "Lyon",
      timestamp: new Date().toISOString(),
      id: 1,
    };
    setupApiIntercepts([existingUser]);
    cy.visit("/");
    cy.wait("@getUsers");
  });

  it("should reject an already registered email and keep state unchanged (1 user)", () => {
    // 1. Starting from previous state (1 registered user)
    cy.get("[data-cy='user-count-value']").should("contain", "1");
    cy.get("[data-cy='users-tbody']").within(() => {
      cy.contains("Marie").should("be.visible");
      cy.contains("marie.martin@example.com").should("be.visible");
    });

    // 2. Navigate to the Form
    cy.get("[data-cy='register-button']").click();
    cy.url().should("include", "/register");

    // 3. Attempt to add with invalid data (email already taken)
    cy.get("[data-cy='input-firstName']").type("Pierre");
    cy.get("[data-cy='input-lastName']").type("Dubois");

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 25);
    const dateString = birthDate.toISOString().split("T")[0];
    cy.get("[data-cy='input-birthDate']").type(dateString);

    cy.get("[data-cy='input-postalCode']").type("33000");
    cy.get("[data-cy='input-city']").type("Bordeaux");

    cy.get("[data-cy='input-email']").type("marie.martin@example.com");
    cy.get("[data-cy='input-email']").blur();

    // 4. Verify the error is displayed
    cy.get("[data-cy='error-email']").should("be.visible");
    cy.get("[data-cy='error-email']").should("contain", "already registered");
    cy.get("[data-cy='submit-button']").should("be.disabled");

    // 5. Return to Home
    cy.get("[data-cy='back-to-home-button']").click();
    cy.url().should("not.include", "/register");

    // 6. Verify "Still 1 registered user" and unchanged list
    cy.get("[data-cy='user-count-value']").should("contain", "1");
    cy.get("[data-cy='users-tbody']").within(() => {
      cy.contains("Marie").should("be.visible");
      cy.contains("marie.martin@example.com").should("be.visible");
      cy.contains("Pierre").should("not.exist");
      cy.contains("Bordeaux").should("not.exist");
    });
  });

  it("should reject a form with empty fields and keep state unchanged (1 user)", () => {
    // 1. Starting from previous state (1 registered user)
    cy.get("[data-cy='user-count-value']").should("contain", "1");

    // 2. Navigate to the Form
    cy.get("[data-cy='register-button']").click();
    cy.url().should("include", "/register");

    // 3. Attempt to add with invalid data (empty fields)
    cy.get("[data-cy='submit-button']").should("be.disabled");

    cy.get("[data-cy='input-firstName']").type("T");
    cy.get("[data-cy='input-firstName']").blur();

    // 4. Verify the error is displayed
    cy.get("[data-cy='error-firstName']").should("be.visible");
    cy.get("[data-cy='submit-button']").should("be.disabled");

    // 5. Return to Home without submitting
    cy.get("[data-cy='back-to-home-button']").click();
    cy.url().should("not.include", "/register");

    // 6. Verify "Still 1 registered user" and unchanged list
    cy.get("[data-cy='user-count-value']").should("contain", "1");
    cy.get("[data-cy='users-tbody']").within(() => {
      cy.contains("Marie").should("be.visible");
    });
  });
});

/**
 * Additional navigation tests
 */
describe("Navigation E2E Tests", () => {
  beforeEach(() => {
    setupApiIntercepts([]);
    cy.visit("/");
    cy.wait("@getUsers");
  });

  /**
   * Test: Home page loads and displays correct elements
   */
  it("should load the home page with correct elements", () => {
    cy.contains("h1", "Registered Users").should("be.visible");
    cy.contains("Total users:").should("be.visible");
    cy.contains("Register New User").should("be.visible");
    cy.contains("No users registered yet").should("be.visible");
  });

  /**
   * Test: Navigate from Home to Register page
   */
  it("should navigate from home to register page", () => {
    cy.contains("Register New User").click();

    cy.url().should("include", "/register");

    cy.contains("h1", "Registration Form").should("be.visible");
    cy.contains("Back to Home").should("be.visible");

    cy.get('input[name="firstName"]').should("be.visible");
    cy.get('input[name="lastName"]').should("be.visible");
    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="birthDate"]').should("be.visible");
    cy.get('input[name="postalCode"]').should("be.visible");
    cy.get('input[name="city"]').should("be.visible");
  });

  /**
   * Test: Navigate from Register back to Home using back button
   */
  it("should navigate back to home from register page", () => {
    cy.contains("Register New User").click();
    cy.url().should("include", "/register");

    cy.contains("Back to Home").click();

    cy.url().should("not.include", "/register");
    cy.contains("h1", "Registered Users").should("be.visible");
  });

  /**
   * Test: Register a user and redirect to home page
   */
  it("should register a user and redirect to home page showing the user", () => {
    cy.contains("Register New User").click();

    cy.get('input[name="firstName"]').type("John");
    cy.get('input[name="lastName"]').type("Doe");
    cy.get('input[name="email"]').type("john.doe@example.com");

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 25);
    const dateString = birthDate.toISOString().split("T")[0];
    cy.get('input[name="birthDate"]').type(dateString);

    cy.get('input[name="postalCode"]').type("75001");
    cy.get('input[name="city"]').type("Paris");

    cy.get('button[type="submit"]').click();
    cy.wait("@createUser");

    cy.url().should("not.include", "/register");

    cy.contains("User successfully registered").should("be.visible");
    cy.contains("Total users:").should("contain", "1");
    cy.contains("John").should("be.visible");
    cy.contains("Doe").should("be.visible");
    cy.contains("john.doe@example.com").should("be.visible");
    cy.contains("Paris").should("be.visible");
    cy.contains("75001").should("be.visible");
  });

  /**
   * Test: Register multiple users and verify they all appear
   */
  it("should register multiple users and display all in the list", () => {
    const users = [
      {
        firstName: "Alice",
        lastName: "Smith",
        email: "alice.smith@example.com",
        postalCode: "69001",
        city: "Lyon",
      },
      {
        firstName: "Bob",
        lastName: "Johnson",
        email: "bob.johnson@example.com",
        postalCode: "13001",
        city: "Marseille",
      },
    ];

    users.forEach((user, index) => {
      cy.contains("Register New User").click();

      cy.get('input[name="firstName"]').type(user.firstName);
      cy.get('input[name="lastName"]').type(user.lastName);
      cy.get('input[name="email"]').type(user.email);

      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30);
      const dateString = birthDate.toISOString().split("T")[0];
      cy.get('input[name="birthDate"]').type(dateString);

      cy.get('input[name="postalCode"]').type(user.postalCode);
      cy.get('input[name="city"]').type(user.city);

      cy.get('button[type="submit"]').click();
      cy.wait("@createUser");

      cy.url().should("not.include", "/register");

      cy.contains("Total users:").should("contain", (index + 1).toString());
    });

    users.forEach((user) => {
      cy.contains(user.firstName).should("be.visible");
      cy.contains(user.lastName).should("be.visible");
      cy.contains(user.email).should("be.visible");
      cy.contains(user.city).should("be.visible");
    });
  });

  /**
   * Test: Empty state message disappears after registering first user
   */
  it("should hide empty state message after registering first user", () => {
    cy.contains("No users registered yet").should("be.visible");

    cy.contains("Register New User").click();

    cy.get('input[name="firstName"]').type("Test");
    cy.get('input[name="lastName"]').type("User");
    cy.get('input[name="email"]').type("test.user@example.com");

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 20);
    const dateString = birthDate.toISOString().split("T")[0];
    cy.get('input[name="birthDate"]').type(dateString);

    cy.get('input[name="postalCode"]').type("33000");
    cy.get('input[name="city"]').type("Bordeaux");

    cy.get('button[type="submit"]').click();
    cy.wait("@createUser");

    cy.url().should("not.include", "/register");

    cy.contains("No users registered yet").should("not.exist");
    cy.contains("Test").should("be.visible");
  });

  /**
   * Test: Data persists across page reloads (via API)
   */
  it("should persist user data across page reloads", () => {
    cy.contains("Register New User").click();

    cy.get('input[name="firstName"]').type("Persistent");
    cy.get('input[name="lastName"]').type("User");
    cy.get('input[name="email"]').type("persistent@example.com");

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 22);
    const dateString = birthDate.toISOString().split("T")[0];
    cy.get('input[name="birthDate"]').type(dateString);

    cy.get('input[name="postalCode"]').type("59000");
    cy.get('input[name="city"]').type("Lille");

    cy.get('button[type="submit"]').click();
    cy.wait("@createUser");

    cy.url().should("not.include", "/register");
    cy.contains("Persistent").should("be.visible");

    const persistentUser = {
      firstName: "Persistent",
      lastName: "User",
      email: "persistent@example.com",
      age: 22,
      postalCode: "59000",
      city: "Lille",
      id: 1,
    };

    // Configure intercept for reload - transform to JSONPlaceholder format
    const apiFormatUser = transformUserToApiFormat(persistentUser);
    cy.intercept("GET", "https://jsonplaceholder.typicode.com/users", {
      statusCode: 200,
      body: [apiFormatUser],
    }).as("getUsersAfterReload");

    cy.reload();
    cy.wait("@getUsersAfterReload");

    cy.contains("Persistent").should("be.visible");
    cy.contains("persistent@example.com").should("be.visible");
    cy.contains("Total users:").should("contain", "1");
  });

  /**
   * Test: Validate that form resets after successful submission
   */
  it("should reset form after successful registration", () => {
    cy.contains("Register New User").click();

    cy.get('input[name="firstName"]').type("Form");
    cy.get('input[name="lastName"]').type("Reset");
    cy.get('input[name="email"]').type("form.reset@example.com");

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 28);
    const dateString = birthDate.toISOString().split("T")[0];
    cy.get('input[name="birthDate"]').type(dateString);

    cy.get('input[name="postalCode"]').type("44000");
    cy.get('input[name="city"]').type("Nantes");

    cy.get('button[type="submit"]').click();
    cy.wait("@createUser");

    cy.url().should("not.include", "/register");

    cy.contains("Register New User").click();

    cy.get('input[name="firstName"]').should("have.value", "");
    cy.get('input[name="lastName"]').should("have.value", "");
    cy.get('input[name="email"]').should("have.value", "");
    cy.get('input[name="birthDate"]').should("have.value", "");
    cy.get('input[name="postalCode"]').should("have.value", "");
    cy.get('input[name="city"]').should("have.value", "");
  });
});
