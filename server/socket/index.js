const SocketIO = require("socket.io");
const { promisify } = require("util");
const redisAdapter = require("socket.io-redis");
const createMiddleware = require("./middleware");
const onlineUser = require("./online-user");
const onlineFriend = require("./online-friend");

function createSocket({ server, authorizer, redis }) {
  const lrangeAsync = promisify(redis.lrange).bind(redis);

  // https://socket.io/docs/v3/handling-cors/
  const io = SocketIO(server, {
    cors: {
      origin: "http://localhost:3001",
      methods: ["GET", "POST"]
    },
    serveClient: true
  });

  io.adapter(redisAdapter({ host: "127.0.0.1", port: 6379 }));

  const middlewares = createMiddleware(authorizer);
  for (let middleware in middlewares) {
    io.use(middlewares[middleware]);
  }

  io.on("connection", socket => {
    const { sub: userId } = socket.user ?? { sub: "" };
    onlineUser.set(userId, socket.id);

    console.log("connecting", { socketId: socket.id, userId });

    // Should update every minute (?).
    notifyPresence(userId, true);

    socket.on("message", async ({ userId: receiverId, msg }, callback) => {
      if (!msg.length) {
        throw new Error("msg is required");
      }
      const payload = {
        senderId: userId,
        receiverId,
        msg,
        ts: Date.now()
      };
      await snapshotMessage(payload);
      socket.to(onlineUser.get(receiverId)).emit("message", {
        ...payload,
        owner: payload.senderId === receiverId
      });
      callback({
        status: "ok"
      });
    });

    socket.on("disconnect", () => {
      console.log("disconnecting", { socketId: socket.id, userId });
      onlineUser.delete(userId);
      notifyPresence(userId);
      // TODO: Store last online date.
    });

    // Utils.
    async function notifyPresence(userId, self = true) {
      const friends = onlineFriend.get(userId, onlineUser);

      const withConversations = async (forUserId, friends = []) => {
        const promises = friends.map(async ({ userId, online }) => ({
          userId,
          online,
          conversations: await getMessages(forUserId, userId)
        }));
        return Promise.all(promises);
      };

      // When you are online, get your friends presence.
      // When you are offline, just notify your friends.
      self &&
        socket.emit("online", {
          friends: await withConversations(userId, friends)
        });

      for (let friend of friends) {
        if (friend.online) {
          const socketId = onlineUser.get(friend.userId);
          const friendFriends = onlineFriend.get(friend.userId, onlineUser);
          socket.to(socketId).emit("online", {
            friends: await withConversations(friend.userId, friendFriends)
          });
        }
      }
    }

    async function snapshotMessage(payload, n = 100) {
      return new Promise((resolve, reject) => {
        const { senderId, receiverId } = payload;
        const key = [senderId, receiverId].sort().join(":");
        redis
          .multi()
          .lpush(key, JSON.stringify(payload))
          .ltrim(key, 0, n - 1) // The end is inclusive.
          .exec((err, replies) => {
            err ? reject(err) : resolve(replies);
          });
      });
    }

    async function getMessages(userId, friendId) {
      try {
        const key = [userId, friendId].sort().join(":");
        const jsons = await lrangeAsync(key, 0, -1);
        const messages = jsons.map(JSON.parse);
        return messages.map(({ senderId, receiverId, msg, ts }) => ({
          owner: senderId === userId,
          senderId,
          receiverId,
          msg,
          ts
        }));
      } catch (err) {
        console.error(err);
        return [];
      }
    }

    // End
  });
}

module.exports = createSocket;
