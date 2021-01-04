import React, { useState, useRef, useEffect } from "react";
import useSocket from "hooks/useSocket";
import FriendList from "components/FriendList";
import styles from "./index.module.css";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [friend, setFriend] = useState("");
  const ref = useRef();

  const { socket, friends, addConversation } = useSocket({
    message: ({ senderId, receiverId, msg, ts, owner }) => {
      if (senderId === friend) {
        // Only update if you are chatting with the current user.
        setMessages(messages =>
          messages.concat({ senderId, receiverId, msg, owner, ts })
        );
      } else {
        // Update the conversations, and add alert.
        addConversation(senderId, { senderId, receiverId, msg, owner, ts });
      }
    }
  });

  const handleChange = e => {
    const msg = e.currentTarget.value;
    setMsg(msg);
  };

  const sendMessage = () => {
    if (!friend) return;
    socket.emit(
      "message",
      {
        msg,
        userId: friend
      },
      response => {
        // Add acknowledgement.
        if (response.status !== "ok") {
          return;
        }

        // Update on sender side only.
        setMessages(messages => messages.concat({ msg, owner: true }));
        setMsg("");
      }
    );
  };

  const handleSend = e => sendMessage();

  const handleKeyDown = e => {
    switch (e.keyCode) {
      case 13:
        sendMessage();
        break;
      default:
    }
  };

  const handleSelectFriend = userId => {
    setFriend(userId);
    const friend = friends.find(friend => friend.userId === userId);
    const conversations = friend?.conversations || [];
    conversations.sort((l, r) => l.ts - r.ts);
    setMessages(conversations);
  };

  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div className={styles.container}>
      <div className={styles.aside}>
        <FriendList
          friends={friends}
          selected={friend}
          onClick={handleSelectFriend}
        />
      </div>
      {friend ? (
        <div className={styles.main}>
          <div className={styles.messages}>
            {messages.map((item, i) => (
              <div
                key={i}
                className={[styles.message, item.owner && styles.owner].join(
                  " "
                )}
              >
                <div className={styles.messageBubble}>{item.msg}</div>
              </div>
            ))}
            <br ref={ref} />
          </div>

          <div className={styles.footer}>
            <input
              onKeyDown={handleKeyDown}
              className={styles.input}
              type="text"
              placeholder="Enter message"
              onChange={handleChange}
              value={msg}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      ) : (
        <div>You do not have any new messages</div>
      )}
    </div>
  );
};

export default Chat;
