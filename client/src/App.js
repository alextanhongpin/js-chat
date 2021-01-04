import "./App.css";
import React from "react";
import useAuth from "hooks/useAuth";

import Login from "pages/Login";
import Chat from "pages/Chat";
import Header from "components/App/Header";

const App = () => {
  const { username, logout } = useAuth();

  return (
    <main id="app">
      {username ? (
        <div id="body">
          <Header username={username} logout={logout} />
          <Chat />
        </div>
      ) : (
        <Login />
      )}
    </main>
  );
};

export default App;
