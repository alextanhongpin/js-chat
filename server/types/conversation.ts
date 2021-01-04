export interface Conversation {
  owner?: boolean;
  senderId: string;
  receiverId: string;
  msg: string;
  ts: number;
}
