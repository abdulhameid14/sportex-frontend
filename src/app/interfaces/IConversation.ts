import { IEmployee } from './IEmployee';
import { IMessage } from './IMessage';

export interface IConversation {
  id: string;
  isDirect: boolean;
  messages?: IMessage[];
  lastMessageContent?: string;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IConversationParticipant {
  id: string;
  conversationId?: string;
  conversation?: IConversation;
  employee: IEmployee;
}
