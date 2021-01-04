import React from "react";
import styles from "./index.module.css";

const FriendItem = ({ userId, online, onClick, selected }) => {
  return (
    <div
      className={[styles.item, selected && styles.selected].join(" ")}
      onClick={() => onClick(userId)}
    >
      <span className={[styles.presence, online && styles.online].join(" ")} />
      {userId}
    </div>
  );
};

const FriendList = ({ friends, selected, onClick }) => {
  return friends.map(friend => (
    <FriendItem
      key={friend.userId}
      {...friend}
      selected={friend.userId === selected}
      onClick={onClick}
    />
  ));
};

export default FriendList;
