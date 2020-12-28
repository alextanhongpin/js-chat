// Fake the relationship to display list of users and who is online.
const friends = {
  john: new Set(["alice", "bob", "jane"]),
  alice: new Set(["john"]),
  bob: new Set(["john", "alice"])
};

// Return the list of friends, with their presence status.
function get(userId, online = new Map()) {
  const users = Array.from(friends[userId] ?? []);
  return users.map(userId => ({
    userId,
    online: online.has(userId)
  }));
}

module.exports = { get };
