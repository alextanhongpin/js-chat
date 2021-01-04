import http from "http";
import { Server } from "socket.io";
import { RedisClient } from "redis";
import { createAdapter } from "socket.io-redis";
import createMiddleware from "./middleware";
import Authorizer from "../usecase/authz";

export default function createSocket(
  server: http.Server,
  authorizer: Authorizer,
  redis: RedisClient
): Server {
  // https://socket.io/docs/v3/handling-cors/
  const io: Server = new Server(server, {
    cors: {
      origin: "http://localhost:3001",
      methods: ["GET", "POST"]
    },
    serveClient: true
  });

  io.adapter(
    createAdapter({
      pubClient: redis.duplicate(),
      subClient: redis.duplicate()
    })
  );

  const middlewares = createMiddleware(authorizer);
  for (let middleware in middlewares) {
    io.use(middlewares[middleware]);
  }

  return io;
}
