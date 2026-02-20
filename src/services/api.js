import axios from "axios";

/**
 * API base URL - JSONPlaceholder for development/testing
 * @constant {string}
 */
const API_BASE_URL = "https://jsonplaceholder.typicode.com";

/**
 * Transform JSONPlaceholder user format to application format
 *
 * @param {Object} apiUser - User object from JSONPlaceholder API
 * @param {number} apiUser.id - User ID
 * @param {string} apiUser.name - Full name (e.g., "Leanne Graham")
 * @param {string} apiUser.email - Email address
 * @param {Object} apiUser.address - Address object
 * @param {string} apiUser.address.city - City name
 * @param {string} apiUser.address.zipcode - Zip code
 * @returns {Object} User object in application format
 *
 * @example
 * transformUserFromApi({
 *   id: 1,
 *   name: "Leanne Graham",
 *   email: "Sincere@april.biz",
 *   address: { city: "Gwenborough", zipcode: "92998-3874" }
 * })
 * // Returns:
 * // {
 * //   id: 1,
 * //   firstName: "Leanne",
 * //   lastName: "Graham",
 * //   email: "sincere@april.biz",
 * //   age: 31,
 * //   city: "Gwenborough",
 * //   postalCode: "92998",
 * //   timestamp: "2026-02-20T..."
 * // }
 */
function transformUserFromApi(apiUser) {
  const nameParts = apiUser.name.trim().split(" ");
  const firstName = nameParts[0] || "Unknown";
  const lastName = nameParts.slice(1).join(" ") || "User";

  const postalCode = apiUser.address?.zipcode?.replace(/[^0-9]/g, "").slice(0, 5) || "00000";

  const age = 25 + ((apiUser.id - 1) % 36);

  return {
    id: apiUser.id,
    firstName: firstName,
    lastName: lastName,
    email: apiUser.email.toLowerCase(),
    age: age,
    city: apiUser.address?.city || "Unknown",
    postalCode: postalCode,
    timestamp: new Date().toISOString(),
  };
}

/**
 * API service for user management
 * Handles all HTTP requests to the backend API
 */
const apiService = {
  /**
   * Fetch all registered users from the API
   * Automatically transforms JSONPlaceholder format to application format
   *
   * @async
   * @returns {Promise<Array<Object>>} Array of user objects in application format
   * @throws {Error} If the API request fails
   *
   * @example
   * const users = await apiService.getUsers();
   * console.log(users); // [{ id: 1, firstName: "Leanne", lastName: "Graham", email: "sincere@april.biz", age: 25, city: "Gwenborough", postalCode: "92998", ... }]
   */
  getUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      return response.data.map(transformUserFromApi);
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
