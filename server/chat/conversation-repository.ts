import { Conversation } from "../types/conversation";
import { RedisClient } from "redis";

export default class ConversationRepository {
  constructor(private readonly redis: RedisClient) {}

  async find(userId: string, friendId: string): Promise<Conversation[]> {
    try {
      const key = [userId, friendId].sort().join(":");
      const jsons: string[] = await new Promise((resolve, reject) =>
        this.redis.lrange(key, 0, -1, (err: Error, result: string[]) =>
          err ? reject(err) : resolve(result)
        )
      );
      const messages: Conversation[] = jsons.map((json: string) =>
        JSON.parse(json)
      );
      return messages.map(({ senderId, receiverId, msg, ts }) => ({
        owner: senderId === userId,
        senderId,
        receiverId,
        msg,
        ts
      }));
    } catch (err) {
      return [];
    }
  }

  async save(conversation: Conversation, n = 100): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const { senderId, receiverId } = conversation;
      const key = [senderId, receiverId].sort().join(":");
      this.redis
        .multi()
        .lpush(key, JSON.stringify(conversation))
        .ltrim(key, 0, n - 1) // The end is inclusive.
        .exec((err: Error, replies: number[]) => {
          err ? reject(err) : resolve(replies);
        });
    });
  }
}
