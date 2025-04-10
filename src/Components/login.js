import React, { useState } from "react";
import { TextInput, Button } from "@carbon/react";
import logo from "../assets/ECHOSTAR.jpg"

const LoginPage = ({ onLogin, error }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle login
  const handleLogin = () => {
    if (userId && password) {
      onLogin(userId, password); // Call the login function passed as a prop
    } else {
      alert("Please enter both User ID and Password");
    }
  };

  // Function to handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleLogin(); // Trigger login when Enter is pressed
    }
  };

  return (
    <div style={{ width: "300px", margin: "100px auto", textAlign: "center" }}>
      <img src={logo} alt="Company Logo" style={{ width: "150px", marginBottom: "20px" }} />
      <TextInput
        id="userId"
        labelText="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        onKeyPress={handleKeyPress} // Trigger handleKeyPress on key press
        style={{ marginBottom: "10px" }}
      />
      <TextInput
        id="password"
        labelText="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={handleKeyPress} // Trigger handleKeyPress on key press
        style={{ marginBottom: "10px" }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Show error message */}
      <Button onClick={handleLogin}>Login</Button> {/* Login button */}
    </div>
  );
};

export default LoginPage;
