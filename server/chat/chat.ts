import ConversationRepository from "./conversation-repository";
import FriendRepository from "./friend-repository";
import Socket from "../types/socket";
import { Conversation } from "../types/conversation";
import { Message } from "../types/message";
import { OnlineUser } from "../types/online-user";
import { Server } from "socket.io";

export default class Chat {
  users = new Map();

  constructor(
    private readonly io: Server,
    private readonly friendRepository: FriendRepository,
    private readonly conversationRepository: ConversationRepository
  ) {
    this.connect();
  }

  connect() {
    this.io.on("connection", (socket: Socket) => {
      this.onConnected(socket);

      socket.on(
        "message",
        async (message: Message, callback: (arg0: unknown) => void) => {
          if (!message.msg.length) {
            return;
          }
          const conversation: Conversation = {
            senderId: socket.user.sub,
            receiverId: message.userId,
            msg: message.msg,
            ts: Date.now()
          };
          await this.conversationRepository.save(conversation);
          socket.to(this.users.get(message.userId)).emit("message", {
            ...conversation,
            owner: conversation.senderId === message.userId
          });
          callback({
            status: "ok"
          });
        }
      );

      socket.on("disconnect", () => {
        this.onDisconnected(socket);
      });
    });
  }

  async onConnected(socket: Socket) {
    console.log("connected", socket.id);

    this.users.set(socket.user.sub, socket.id);
    await this.notifyPresence(socket, true);
  }

  async onDisconnected(socket: Socket) {
    console.log("disconnected", socket.id);

    this.users.delete(socket.user.sub);
    await this.notifyPresence(socket, false);
  }

  async notifyPresence(socket: Socket, online = false) {
    const userId = socket.user.sub;
    const friends = await this.friendsWithConversations(userId);

    online &&
      socket.emit("online", {
        friends
      });

    for await (let friend of friends) {
      if (friend.online) {
        const socketId = this.users.get(friend.userId);
        const friendFriends = await this.friendsWithConversations(
          friend.userId
        );
        socket.to(socketId).emit("online", {
          friends: friendFriends
        });
      }
    }
  }

  checkOnline(userId: string): boolean {
    return this.users.has(userId);
  }

  async friendsWithConversations(userId: string): Promise<OnlineUser[]> {
    const friends = await this.friendRepository.findByUserId(userId);
    const promises = friends.map(async friendId => ({
      userId: friendId,
      online: this.checkOnline(friendId),
      conversations: await this.conversationRepository.find(userId, friendId)
    }));
    return Promise.all(promises);
  }
}
