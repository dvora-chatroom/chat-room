import {
  createMessage,
  createBotMessage,
  hasMoreThanTwoWords,
  keepLastMessages,
  User,
  ChatMessage
} from '../../libs/shared/src/lib/shared';

describe('Shared Utilities', () => {
  const mockUser: User = {
    name: 'TestUser',
    socketId: 'socket_123'
  };

  describe('createMessage', () => {
    it('should create a message with proper structure', () => {
      const message = createMessage(mockUser, 'Hello world!');
      
      expect(message).toMatchObject({
        user: 'TestUser',
        message: 'Hello world!',
        timestamp: expect.any(Date)
      });
      expect(message.id).toMatch(/socket_123-\d+/);
    });

    it('should generate unique IDs for different messages', () => {
      const originalDateNow = Date.now;
      let timestamp = 1000;
      Date.now = jest.fn(() => timestamp++);
      
      const message1 = createMessage(mockUser, 'First message');
      const message2 = createMessage(mockUser, 'Second message');
      
      expect(message1.id).not.toBe(message2.id);
      
      // Restore original Date.now
      Date.now = originalDateNow;
    });
  });

  describe('createBotMessage', () => {
    it('should create a bot message with proper structure', () => {
      const message = createBotMessage('PoetBot', 'Greetings in verse!');
      
      expect(message).toMatchObject({
        user: 'PoetBot',
        message: 'Greetings in verse!',
        timestamp: expect.any(Date)
      });
      expect(message.id).toMatch(/bot-\d+/);
    });

    it('should generate unique IDs for different bot messages', () => {
      const originalDateNow = Date.now;
      let timestamp = 2000;
      Date.now = jest.fn(() => timestamp++);
      
      const message1 = createBotMessage('PoetBot', 'First response');
      const message2 = createBotMessage('PoetBot', 'Second response');
      
      expect(message1.id).not.toBe(message2.id);
      
      // Restore original Date.now
      Date.now = originalDateNow;
    });
  });

  describe('hasMoreThanTwoWords', () => {
    it('should return false for empty string', () => {
      expect(hasMoreThanTwoWords('')).toBe(false);
    });

    it('should return false for single word', () => {
      expect(hasMoreThanTwoWords('Hello')).toBe(false);
    });

    it('should return false for two words', () => {
      expect(hasMoreThanTwoWords('Hello world')).toBe(false);
    });

    it('should return true for three or more words', () => {
      expect(hasMoreThanTwoWords('Hello world there')).toBe(true);
      expect(hasMoreThanTwoWords('How are you today')).toBe(true);
      expect(hasMoreThanTwoWords('This is a test message')).toBe(true);
    });

    it('should handle extra whitespace', () => {
      expect(hasMoreThanTwoWords('  Hello   world  !  ')).toBe(true);
    });
  });

  describe('keepLastMessages', () => {
    it('should keep all messages when under limit', () => {
      const messages: ChatMessage[] = [
        { id: '1', user: 'User1', message: 'Hello', timestamp: new Date() },
        { id: '2', user: 'User2', message: 'Hi', timestamp: new Date() }
      ];
      
      keepLastMessages(messages, 5);
      expect(messages).toHaveLength(2);
    });

    it('should keep only last N messages when over limit', () => {
      const messages: ChatMessage[] = Array.from({ length: 10 }, (_, i) => ({
        id: `msg_${i}`,
        user: 'User',
        message: `Message ${i}`,
        timestamp: new Date()
      }));
      
      keepLastMessages(messages, 5);
      expect(messages).toHaveLength(5);
      expect(messages[0].id).toBe('msg_5');
      expect(messages[4].id).toBe('msg_9');
    });

    it('should use default limit of 100', () => {
      const messages: ChatMessage[] = Array.from({ length: 150 }, (_, i) => ({
        id: `msg_${i}`,
        user: 'User',
        message: `Message ${i}`,
        timestamp: new Date()
      }));
      
      keepLastMessages(messages);
      expect(messages).toHaveLength(100);
      expect(messages[0].id).toBe('msg_50');
      expect(messages[99].id).toBe('msg_149');
    });

    it('should handle empty array', () => {
      const messages: ChatMessage[] = [];
      keepLastMessages(messages, 10);
      expect(messages).toHaveLength(0);
    });
  });
});
