import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UserForm from "../components/UserForm";
import { useUsers } from "../contexts/UserContext";
import "react-toastify/dist/ReactToastify.css";
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
  const handleUserRegistered = async (userData) => {
    try {
      await addUser(userData);
      navigate("/", { state: { newUserEmail: userData.email } });
    } catch (error) {
      // Error is already logged in UserContext, but we show toast for user feedback
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data?.message || "Invalid data. Please check your inputs.", {
            position: "top-right",
            autoClose: 5000,
          });
        } else if (error.response.status >= 500) {
          toast.error("Server error. Please try again later.", {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          toast.error(error.response.data?.message || "An error occurred. Please try again.", {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } else {
        toast.error("Network error. Please check your connection.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    }
  };

  return (
    <div className="register-page" data-cy="register-page">
      <UserForm onUserRegistered={handleUserRegistered} />
      <div className="back-link">
        <button onClick={() => navigate("/")} className="back-button" data-cy="back-to-home-button">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default Register;
