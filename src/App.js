import React, { useState, useEffect } from "react";
import "./App.scss";
import { Header, HeaderName } from "@carbon/react";
import LoginPage from "./Components/login";
import FileTextStreamer from "./Components/carbonTextStreaming";
import axios from "axios";

const App = () => {
  const [user, setUser] = useState(null); // Store logged-in user info
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if the user is logged in by making a request to the server
    axios
      .get(
        "https://truckroll-backend-customer-experience-support.apps.67b2ba705f4b538adb2ae9a1.am1.techzone.ibm.com/check-session",
        { withCredentials: true }
      )
      .then((response) => {
        setUser(response.data.user); // Set user info from session
      })
      .catch(() => {
        setUser(null); // No user session found
      });
  }, []);

  const handleLogin = async (userId, password) => {
    try {
      // Send login request to the backend
      const response = await axios.post(
        "https://truckroll-backend-customer-experience-support.apps.67b2ba705f4b538adb2ae9a1.am1.techzone.ibm.com/login",
        { userId, password },
        { withCredentials: true }
      );

      // If login is successful, set the user
      setUser({ userId });
    } catch (error) {
      // If login fails, show an error message
      setError("Invalid credentials. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://truckroll-backend-customer-experience-support.apps.67b2ba705f4b538adb2ae9a1.am1.techzone.ibm.com/logout",
        {},
        { withCredentials: true }
      );
      setUser(null); // Clear user state
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div>
      {/* Header */}
      <Header style={{ backgroundColor: "black", padding: "20px 0" }}>
        <HeaderName prefix="IBM" style={{ color: "white" }}>
          Truck Roll Recommendation
        </HeaderName>
      </Header>

      {/* Main Content */}
      {/* {user ? ( */}
      <FileTextStreamer />
      {/* ) : (
        <LoginPage onLogin={handleLogin} error={error} />
      )} */}
    </div>
  );
};

export default App;
