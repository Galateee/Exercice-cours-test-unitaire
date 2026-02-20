import axios from "axios";

/**
 * API base URL - JSONPlaceholder for development/testing
 * @constant {string}
 */
const API_BASE_URL = "https://jsonplaceholder.typicode.com";

/**
 * API service for user management
 * Handles all HTTP requests to the backend API
 */
const apiService = {
  /**
   * Fetch all registered users from the API
   *
   * @async
   * @returns {Promise<Array<Object>>} Array of user objects
   * @throws {Error} If the API request fails
   *
   * @example
   * const users = await apiService.getUsers();
   * console.log(users); // [{ id: 1, firstName: "John", ... }]
   */
  getUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  /**
   * Create a new user via API
   *
   * @async
   * @param {Object} userData - User data object
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @param {string} userData.email - User's email address
   * @param {number} userData.age - User's age
   * @param {string} userData.postalCode - User's postal code
   * @param {string} userData.city - User's city
   * @returns {Promise<Object>} Created user object with server-generated ID
   * @throws {Error} If the API request fails (400, 500, etc.)
   *
   * @example
   * const newUser = await apiService.createUser({
   *   firstName: "John",
   *   lastName: "Doe",
   *   email: "john@example.com",
   *   age: 25,
   *   postalCode: "75001",
   *   city: "Paris"
   * });
   */
  createUser: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, userData);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
};

export default apiService;
