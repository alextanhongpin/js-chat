import ConversationRepository from "./conversation-repository";
import FriendRepository from "./friend-repository";
import Socket from "../types/socket";
import { Conversation } from "../types/conversation";
import { Message } from "../types/message";
import { OnlineUser } from "../types/online-user";
import { Server } from "socket.io";
import { RedisAdapter } from "socket.io-redis";

export default class Chat {
  //users = new Map();

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
          //socket.to(this.users.get(message.userId)).emit("message", {
          // Send to your own room (Why? Because the sender can be online in multiple app, not just one).
          // If we just update the local state, the same sender will not receive the update.
          await this.io.to(socket.user.sub).emit("message", {
            ...conversation,
            owner: true
          });
          // Send to your friend's room.
          await socket.to(message.userId).emit("message", {
            ...conversation,
            owner: false
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

    // Bad mistake. If the user logins from different app, the id will be overwritten.
    //this.users.set(socket.user.sub, socket.id);
    await this.adapter.remoteJoin(socket.id, socket.user.sub);
    // DEBUG: Check the rooms created when user join.
    //console.log("join", await this.adapter.allRooms());
    await this.notifyPresence(socket, true);
  }

  async onDisconnected(socket: Socket) {
    console.log("disconnected", socket.id);

    // Bad mistake. If the user logins from different app, the id will be overwritten.
    //this.users.delete(socket.user.sub);
    // NOTE: We do not need to write the logic to leave the room, it is
    // automatically handled.
    // Doing so will throw an error, because you can't leave a room that you
    // left (IKR).
    //await this.adapter.remoteLeave(socket.id, socket.user.sub);
    // // DEBUG: Uncomment to test this hypothesis (rooms should be empty).
    //console.log("leave", await this.adapter.allRooms());
    await this.notifyPresence(socket, false);
  }

  // A convenient getter to cast the Adapter type to RedisAdapter.
  get adapter() {
    return this.io.of("/").adapter as RedisAdapter;
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
        //const socketId = this.users.get(friend.userId);
        const friendFriends = await this.friendsWithConversations(
          friend.userId
        );
        socket.to(friend.userId).emit("online", {
          friends: friendFriends
        });
      }
    }
  }

  async checkOnline(userId: string): Promise<boolean> {
    // Return the sets containing the socket id in the given room with (user id).
    //const socketIdSet = await this.adapter.sockets(new Set([userId]));
    const socketIdSet = await this.io.in(userId).allSockets();
    return socketIdSet.size > 0;
    //return this.users.has(userId);
  }

  async friendsWithConversations(userId: string): Promise<OnlineUser[]> {
    const friends = await this.friendRepository.findByUserId(userId);
    const promises = friends.map(async friendId => ({
      userId: friendId,
      online: await this.checkOnline(friendId),
      conversations: await this.conversationRepository.find(userId, friendId)
    }));
    return Promise.all(promises);
  }
}
