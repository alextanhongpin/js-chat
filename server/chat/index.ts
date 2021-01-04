import { RedisClient } from "redis";
import http from "http";

import ConversationRepository from "./conversation-repository";
import FriendRepository from "./friend-repository";
import Authorizer from "../usecase/authz";
import createSocket from "./socket";
import Chat from "./chat";

export default function createChat(
  server: http.Server,
  redis: RedisClient,
  authorizer: Authorizer
) {
  const io = createSocket(server, authorizer, redis);
  const conversationRepository = new ConversationRepository(redis);
  const friendRepository = new FriendRepository();
  const chat = new Chat(io, friendRepository, conversationRepository);
  return chat;
}
