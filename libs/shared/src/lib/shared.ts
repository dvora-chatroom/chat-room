export function shared(): string {
  return 'shared';
}

export interface User {
  name: string;
  socketId: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

export interface TypingUser {
  user: string;
  isTyping: boolean;
}

export const ChatEvents = {
  Users: 'users',
  Messages: 'messages',
  NewMessage: 'newMessage',
  UserJoined: 'userJoined',
  UserLeft: 'userLeft',
  Typing: 'typing',
  UserTyping: 'userTyping'
} as const;

export type ChatEventName = typeof ChatEvents[keyof typeof ChatEvents];

export const POETBOT_NAME = 'PoetBot';
export const POETBOT_ID = 'poetbot';

export function createMessage(user: User, message: string): ChatMessage {
  return {
    id: `${user.socketId}-${Date.now()}`,
    user: user.name,
    message,
    timestamp: new Date()
  };
}

export function createBotMessage(botName: string, message: string): ChatMessage {
  return {
    id: `bot-${Date.now()}`,
    user: botName,
    message,
    timestamp: new Date()
  };
}

export function hasMoreThanTwoWords(text: string): boolean {
  return text.trim().split(/\s+/).length > 2;
}

export function keepLastMessages(messages: ChatMessage[], maxCount: number = 100): void {
  if (messages.length > maxCount) {
    messages.splice(0, messages.length - maxCount);
  }
}
