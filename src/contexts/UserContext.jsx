import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";

/**
 * @typedef {Object} User
 * @property {string} firstName - First name of the user
 * @property {string} lastName - Last name of the user
 * @property {string} email - Email address of the user
 * @property {number} age - Age of the user
 * @property {string} postalCode - Postal code of the user
 * @property {string} city - City of the user
 * @property {string} timestamp - ISO date string of registration
 */

/**
 * @typedef {Object} UserContextValue
 * @property {User[]} users - Array of registered users
 * @property {function(User): Promise<void>} addUser - Function to add a new user (async)
 * @property {function(): Promise<void>} refreshUsers - Function to refresh users from API (async)
 * @property {boolean} loading - Loading state for API operations
 * @property {string|null} error - Error message if API call fails
 */

const UserContext = createContext(undefined);

/**
 * UserProvider component that manages user state globally
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load users from API
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedUsers = await apiService.getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error loading users from API:", error);
      setError(error.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new user via API
   *
   * @param {User} user - User object to add
   * @returns {Promise<Object>} Created user object
   * @throws {Error} If API call fails
   */
  const addUser = async (user) => {
    try {
      setLoading(true);
      setError(null);
      const createdUser = await apiService.createUser(user);
      setUsers((prevUsers) => [...prevUsers, createdUser]);
      return createdUser;
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error.message || "Failed to create user");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh users from API
   */
  const refreshUsers = async () => {
    await loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const value = {
    users,
    addUser,
    refreshUsers,
    loading,
    error,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Custom hook to use the UserContext
 *
 * @returns {UserContextValue} User context value
 * @throws {Error} If used outside of UserProvider
 */
export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}

export default UserContext;
