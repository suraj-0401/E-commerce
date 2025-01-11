import React, {  } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const GoogleSignIn = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLoginSuccess = async (credentialResponse) => {

    const token = credentialResponse.credential;
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    try {
      const response = await fetch(`${BASE_URL}/google-signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to authenticate with the backend");
      }

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem("authToken", data.token); 
        localStorage.setItem("isLoggedIn", "true"); 
        setIsLoggedIn(true); 
        console.log("Login successful!");
        navigate("/shop");
      } else {
        console.error("Login failed. Token not received.");
      }
    } catch (error) {
      console.error("Error during login:", error.message);
      alert("Login failed. Please try again.");
    }
  };

  const handleLoginError = () => {
    console.error("Login Failed");
    alert("Login failed. Please try again.");
  };
  const clientId=process.env.REACT_APP_GOOGLE_ID;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "50px",
        }}
      >
        <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleSignIn;