import { IConversation } from "./IConversation";
import { IEmployee } from "./IEmployee";

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: string;
  createdAt: string;
  readAt?: Date;
  conversation?: IConversation;
  sender?: IEmployee;
}
