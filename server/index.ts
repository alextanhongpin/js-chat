import express from "express";
import cors from "cors";
import http from "http";
import redis from "redis";

import createRouter from "./router";
import createChat from "./chat";

// UseCases.
import Authorizer from "./usecase/authz";

// Environment variables.
const PORT = process.env.PORT || 3000;

const app = express();

const client = redis.createClient();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Init usecases.
const authorizer = new Authorizer();

createRouter({
  app,
  authorizer
});
const server = http.createServer(app);

createChat(server, client, authorizer);

server.listen(PORT, () => {
  console.log(`listening on port *:${PORT}. press ctrl + c to cancel.`);
});
// TODO: Graceful shutdown. Terminate redis client (client.end(true))
