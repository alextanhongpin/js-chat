import { Conversation } from "./conversation";

abstract class ConversationRepository {
  save(conversation: Conversation, n: number): Promise<boolean> {}

  find(userId: string, friendId: string): Promise<Conversation[]> {}
}

