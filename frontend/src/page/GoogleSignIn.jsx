import React, {  } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { base_url, google_id } from "../Urls";

const GoogleSignIn = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLoginSuccess = async (credentialResponse) => {

    const token = credentialResponse.credential;
    try {
      const response = await fetch(`${base_url}/google-signin`, {
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

  return (
    <GoogleOAuthProvider clientId={google_id}>
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