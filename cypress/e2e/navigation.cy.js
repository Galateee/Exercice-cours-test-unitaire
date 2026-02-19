/* global cy, Cypress */

/**
 * E2E Tests for Navigation between pages
 * Tests the routing and navigation flow of the application
 */

/**
 * Scénario Nominal - Navigation et inscription d'un nouvel utilisateur
 */
describe("Scénario Nominal - Navigation et inscription", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("devrait permettre d'inscrire un utilisateur et voir la mise à jour du compteur et de la liste", () => {
    // 1. Navigation vers Accueil → Vérifier "0 utilisateur inscrit" et liste vide
    cy.visit("/");
    cy.get("[data-cy='home-page']").should("be.visible");
    cy.get("[data-cy='user-count-value']").should("contain", "0");
    cy.get("[data-cy='empty-state']").should("be.visible");
    cy.get("[data-cy='users-list']").should("not.exist");

    // 2. Clic/Navigation vers le Formulaire (/register)
    cy.get("[data-cy='register-button']").click();
    cy.url().should("include", "/register");
    cy.get("[data-cy='register-page']").should("be.visible");
    cy.get("[data-cy='form-title']").should("contain", "Registration Form");

    // 3. Ajout d'un nouvel utilisateur valide (Succès)
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

    // 4. Redirection ou Navigation vers l'Accueil
    cy.url().should("not.include", "/register");
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // 5. Vérifier "1 utilisateur inscrit" ET la présence du nouvel utilisateur dans la liste
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
 * Scénario d'Erreur - Tentative d'ajout invalide avec état inchangé
 */
describe("Scénario d'Erreur - Validation et état inchangé", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    const existingUser = {
      firstName: "Marie",
      lastName: "Martin",
      email: "marie.martin@example.com",
      age: 28,
      postalCode: "69001",
      city: "Lyon",
      timestamp: new Date().toISOString(),
    };
    cy.window().then((win) => {
      win.localStorage.setItem("registeredUsers", JSON.stringify([existingUser]));
    });
  });

  it("devrait refuser un email déjà pris et garder l'état inchangé (1 utilisateur)", () => {
    // 1. Partant de l'état précédent (1 inscrit)
    cy.visit("/");
    cy.get("[data-cy='user-count-value']").should("contain", "1");
    cy.get("[data-cy='users-tbody']").within(() => {
      cy.contains("Marie").should("be.visible");
      cy.contains("marie.martin@example.com").should("be.visible");
    });

    // 2. Navigation vers le Formulaire
    cy.get("[data-cy='register-button']").click();
    cy.url().should("include", "/register");

    // 3. Tentative d'ajout invalide (email déjà pris)
    cy.get("[data-cy='input-firstName']").type("Pierre");
    cy.get("[data-cy='input-lastName']").type("Dubois");
    cy.get("[data-cy='input-email']").type("marie.martin@example.com"); // Email déjà utilisé

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 25);
    const dateString = birthDate.toISOString().split("T")[0];
    cy.get("[data-cy='input-birthDate']").type(dateString);

    cy.get("[data-cy='input-postalCode']").type("33000");
    cy.get("[data-cy='input-city']").type("Bordeaux");

    cy.get("[data-cy='input-email']").focus().blur();

    // 4. Vérifier l'erreur affichée
    cy.get("[data-cy='error-email']").should("be.visible");
    cy.get("[data-cy='error-email']").should("contain", "already registered");
    cy.get("[data-cy='submit-button']").should("be.disabled");

    // 5. Retour vers l'Accueil
    cy.get("[data-cy='back-to-home-button']").click();
    cy.url().should("not.include", "/register");

    // 6. Vérifier "Toujours 1 utilisateur inscrit" et la liste inchangée
    cy.get("[data-cy='user-count-value']").should("contain", "1");
    cy.get("[data-cy='users-tbody']").within(() => {
      cy.contains("Marie").should("be.visible");
      cy.contains("marie.martin@example.com").should("be.visible");
      cy.contains("Pierre").should("not.exist");
      cy.contains("Bordeaux").should("not.exist");
    });
  });

  it("devrait refuser un formulaire avec champs vides et garder l'état inchangé (1 utilisateur)", () => {
    // 1. Partant de l'état précédent (1 inscrit)
    cy.visit("/");
    cy.get("[data-cy='user-count-value']").should("contain", "1");

    // 2. Navigation vers le Formulaire
    cy.get("[data-cy='register-button']").click();
    cy.url().should("include", "/register");

    // 3. Tentative d'ajout invalide (champs vides)
    cy.get("[data-cy='submit-button']").should("be.disabled");

    cy.get("[data-cy='input-firstName']").type("T");
    cy.get("[data-cy='input-firstName']").blur();

    // 4. Vérifier l'erreur affichée
    cy.get("[data-cy='error-firstName']").should("be.visible");
    cy.get("[data-cy='submit-button']").should("be.disabled");

    // 5. Retour vers l'Accueil sans soumettre
    cy.get("[data-cy='back-to-home-button']").click();
    cy.url().should("not.include", "/register");

    // 6. Vérifier "Toujours 1 utilisateur inscrit" et la liste inchangée
    cy.get("[data-cy='user-count-value']").should("contain", "1");
    cy.get("[data-cy='users-tbody']").within(() => {
      cy.contains("Marie").should("be.visible");
    });
  });
});

/**
 * Tests supplémentaires de navigation
 */
describe("Navigation E2E Tests", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/");
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

    cy.url().should("not.include", "/register");

    cy.contains("Utilisateur enregistré avec succès").should("be.visible");

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

    cy.url().should("not.include", "/register");

    cy.contains("No users registered yet").should("not.exist");
    cy.contains("Test").should("be.visible");
  });

  /**
   * Test: Data persists across page reloads
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

    cy.url().should("not.include", "/register");

    cy.contains("Persistent").should("be.visible");

    cy.reload();

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
