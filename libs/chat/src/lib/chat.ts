import { User, ChatMessage } from '@chat-room/shared';

export function hasMoreThanTwoWords(text: string): boolean {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  return words.length > 2;
}

export function createMessage(user: User, message: string): ChatMessage {
  return {
    id: Date.now().toString(),
    user: user.name,
    message: message.trim(),
    timestamp: new Date()
  };
}

export function createBotMessage(botName: string, message: string): ChatMessage {
  return {
    id: (Date.now() + 1).toString(),
    user: botName,
    message: message,
    timestamp: new Date()
  };
}

export function keepLastMessages(messages: ChatMessage[], maxCount: number = 100): ChatMessage[] {
  if (messages.length > maxCount) {
    return messages.slice(-maxCount);
  }
  return messages;
}
