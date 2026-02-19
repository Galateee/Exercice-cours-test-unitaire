import React, { createContext, useContext, useState, useEffect } from "react";

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
 * @property {function(User): void} addUser - Function to add a new user
 * @property {function(): void} refreshUsers - Function to refresh users from localStorage
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

  /**
   * Load users from localStorage
   */
  const loadUsers = () => {
    try {
      const storedUsers = localStorage.getItem("registeredUsers");
      const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      setUsers(parsedUsers);
    } catch (error) {
      console.error("Error loading users from localStorage:", error);
      setUsers([]);
    }
  };

  /**
   * Add a new user to the list and save to localStorage
   *
   * @param {User} user - User object to add
   */
  const addUser = (user) => {
    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
  };

  /**
   * Refresh users from localStorage
   */
  const refreshUsers = () => {
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const value = {
    users,
    addUser,
    refreshUsers,
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
