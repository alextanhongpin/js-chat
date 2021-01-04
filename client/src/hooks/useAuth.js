import React, { useState, useEffect, useContext } from "react";
import { AuthApi } from "apis";

const useAuthorize = () => {
  const [username, setUsername] = useState("");
  const [accessToken, setAccessToken] = useState(
    window.localStorage.getItem("accessToken")
  );

  useEffect(
    () => {
      async function authorize() {
        const username = await AuthApi.authorize();
        setUsername(username);
      }
      if (accessToken) {
        authorize();
      }
    },
    [accessToken]
  );

  const logout = () => {
    window.localStorage.removeItem("accessToken");
    setAccessToken("");
    setUsername("");
  };

  const login = accessToken => {
    setAccessToken(accessToken);
    window.localStorage.setItem("accessToken", accessToken);
  };

  return {
    accessToken,
    username,
    login,
    logout
  };
};

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const authorize = useAuthorize();
  return (
    <AuthContext.Provider value={authorize}>{children}</AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be within AuthProvider");
  }
  return context;
};

export default useAuth;
