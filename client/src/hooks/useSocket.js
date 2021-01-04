import { useState, useRef, useEffect } from "react";
import * as Socket from "socket.io-client";

import useAuth from "hooks/useAuth";

const SOCKET_ENDPOINT = "http://localhost:3000";

const useSocket = (handlers = {}) => {
  const { accessToken } = useAuth();
  const [error, setError] = useState("");
  const [friends, setFriends] = useState([]);
  const ref = useRef();

  useEffect(
    () => {
      if (!ref.current) return;

      const socket = ref.current;

      for (let key in handlers) {
        socket.on(key, handlers[key]);
      }

      return () => {
        for (let key in handlers) {
          socket.off(key, handlers[key]);
        }
      };
    },
    [handlers]
  );

  useEffect(
    () => {
      if (!accessToken) return;

      const socket = Socket(SOCKET_ENDPOINT, {
        extraHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      ref.current = socket;

      socket.on("online", ({ friends }) => {
        setFriends(friends);
      });

      socket.on("error", err => {
        setError(err.message);
      });

      return () => {
        socket.disconnect();
      };
    },
    [accessToken]
  );

  function addConversation(friendId, conversation) {
    setFriends(friends => {
      return friends.map(friend => {
        // The data set on the client side does not have a user id.
        if (friend.userId && friend.userId !== friendId) {
          return friend;
        }
        return {
          ...friend,
          conversations: friend.conversations.concat(conversation)
        };
      });
    });
  }

  return {
    socket: ref.current,
    error,
    friends,
    addConversation
  };
};

export default useSocket;
