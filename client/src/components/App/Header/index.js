import React from "react";

import styles from "./index.module.css";

const Header = ({ username, logout }) => {
  return (
    <div className={styles.header}>
      <b>Chat</b>
      <div>
        <span>{username}</span>
        &nbsp; &nbsp;
        <button className={styles.button} onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
