import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import Home from "./pages/Home";
import Register from "./pages/Register";
import "./App.css";

/**
 * Main App component that sets up routing and global state
 *
 * @component
 * @returns {JSX.Element} The main application component with routes
 */
function App() {
  return (
    <UserProvider>
      <Router basename={process.env.PUBLIC_URL}>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
