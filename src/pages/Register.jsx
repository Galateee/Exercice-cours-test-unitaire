import { useNavigate } from "react-router-dom";
import UserForm from "../components/UserForm";
import { useUsers } from "../contexts/UserContext";
import "./Register.css";

/**
 * Register page component that wraps the UserForm
 * Handles successful registration by adding user to context and navigating to home
 *
 * @component
 * @returns {JSX.Element} Register page with form
 */
function Register() {
  const navigate = useNavigate();
  const { addUser } = useUsers();

  /**
   * Handle successful form submission
   * @param {Object} userData - User data from the form
   */
  const handleUserRegistered = (userData) => {
    addUser(userData);
    // Navigate immediately to home page with new user email
    navigate("/", { state: { newUserEmail: userData.email } });
  };

  return (
    <div className="register-page">
      <UserForm onUserRegistered={handleUserRegistered} />
      <div className="back-link">
        <button onClick={() => navigate("/")} className="back-button">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default Register;
