const SocketIO = require("socket.io");
const createMiddleware = require("./middleware");
const onlineUser = require("./online-user");
const onlineFriend = require("./online-friend");

function createSocket({ server, authorizer }) {
  // https://socket.io/docs/v3/handling-cors/
  const io = SocketIO(server, {
    cors: {
      origin: "http://localhost:3001",
      methods: ["GET", "POST"]
    },
    serveClient: true
  });

  const middlewares = createMiddleware(authorizer);
  for (let middleware in middlewares) {
    io.use(middlewares[middleware]);
  }

  io.on("connection", socket => {
    const { sub: userId } = socket.user ?? { sub: "" };
    onlineUser.set(userId, socket.id);

    console.log("connecting", { socketId: socket.id, userId });
    function notifyPresence(userId, self = true) {
      const friends = onlineFriend.get(userId, onlineUser);

      // When you are online, get your friends presence.
      // When you are offline, just notify your friends.
      self &&
        socket.emit("online", {
          friends
        });

      for (let friend of friends) {
        if (friend.online) {
          const socketId = onlineUser.get(friend.userId);
          socket.to(socketId).emit("online", {
            friends: onlineFriend.get(friend.userId, onlineUser)
          });
        }
      }
    }
    // Should update every minute (?).
    notifyPresence(userId, true);

    socket.on("greet", ({ msg }) => {
      io.emit("hello", {
        id: socket.id,
        user: userId,
        msg
      });
    });

    socket.on("disconnect", () => {
      console.log("disconnecting", { socketId: socket.id, userId });
      onlineUser.delete(userId);
      notifyPresence(userId);
    });
  });
}

module.exports = createSocket;
