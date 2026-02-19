import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useUsers } from "../contexts/UserContext";
import "react-toastify/dist/ReactToastify.css";
import "./Home.css";

/**
 * Home component that displays the list of registered users
 *
 * @component
 * @returns {JSX.Element} Home page with user list
 */
function Home() {
  const { users } = useUsers();
  const location = useLocation();
  const [highlighte, setHighlighte] = useState(null);

  // Show success toast when redirected from registration
  useEffect(() => {
    if (location.state?.newUserEmail) {
      toast.success("Utilisateur enregistré avec succès !", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Store the new user email for highlighting
      setHighlighte(location.state.newUserEmail);

      // Clear the navigation state
      window.history.replaceState({}, document.title);

      // Remove highlight after animation
      setTimeout(() => {
        setHighlighte(null);
      }, 3000);
    }
  }, [location.state]);

  // Sort users by timestamp (most recent first)
  const sortedUsers = [...users].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="home-container">
      <ToastContainer />
      <h1>Registered Users</h1>

      <div className="stats">
        <p>
          Total users: <strong>{users.length}</strong>
        </p>
      </div>

      <Link to="/register" className="register-link">
        <button className="register-button">Register New User</button>
      </Link>

      {users.length === 0 ? (
        <div className="empty-state">
          <p>No users registered yet.</p>
          <p>Click the button above to register your first user!</p>
        </div>
      ) : (
        <div className="users-list">
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>City</th>
                <th>Postal Code</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user, index) => {
                const isNewUser = highlighte === user.email;
                return (
                  <tr key={`${user.email}-${index}`} className={isNewUser ? "new-user-highlight" : ""}>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.age}</td>
                    <td>{user.city}</td>
                    <td>{user.postalCode}</td>
                    <td>{new Date(user.timestamp).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Home;
