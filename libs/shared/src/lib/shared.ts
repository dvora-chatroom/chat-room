/**
 * Shared utility function for the chat room application.
 * @returns A string indicating the shared module is working.
 */
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

/**
 * Creates a new chat message with proper ID and timestamp.
 * @param user - The user sending the message
 * @param message - The message content
 * @returns A new ChatMessage object
 */
export function createMessage(user: User, message: string): ChatMessage {
  return {
    id: `${user.socketId}-${Date.now()}`,
    user: user.name,
    message,
    timestamp: new Date()
  };
}

/**
 * Creates a message from a bot with special ID format.
 * @param botName - The name of the bot
 * @param message - The message content
 * @returns A new ChatMessage object for the bot
 */
export function createBotMessage(botName: string, message: string): ChatMessage {
  return {
    id: `bot-${Date.now()}`,
    user: botName,
    message,
    timestamp: new Date()
  };
}

/**
 * Validates if a message has more than two words (used for bot triggers).
 * @param text - The text to validate
 * @returns True if the text has more than 2 words
 */
export function hasMoreThanTwoWords(text: string): boolean {
  return text.trim().split(/\s+/).length > 2;
}

/**
 * Maintains message list size by keeping only the last N messages.
 * @param messages - Array of messages to trim
 * @param maxCount - Maximum number of messages to keep (default: 100)
 */
export function keepLastMessages(messages: ChatMessage[], maxCount: number = 100): void {
  if (messages.length > maxCount) {
    messages.splice(0, messages.length - maxCount);
  }
}
