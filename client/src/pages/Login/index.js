import React from "react";
import { AuthApi } from "apis";
import { useState } from "react";
import useAuth from "hooks/useAuth";

import styles from "./index.module.css";

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      const accessToken = await AuthApi.login({ username });
      login(accessToken);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div className={styles.body}>
      <div>
        <h1>Sign In</h1>
        {error && <div>{error?.message}</div>}
        <div>
          <input
            className={styles.input}
            type="text"
            value={username}
            onChange={e => setUsername(e.currentTarget.value)}
            placeholder="Enter username, e.g. john"
          />
        </div>
        <br />
        <button className={styles.button} onClick={handleSubmit}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
