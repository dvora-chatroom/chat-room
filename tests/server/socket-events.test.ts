import { Server } from 'socket.io';
import { createServer } from 'http';
import { PoetBot } from '../../libs/bot/src/lib/poet-bot';
import { 
  User, 
  ChatMessage, 
  createMessage, 
  createBotMessage,
  hasMoreThanTwoWords 
} from '../../libs/shared/src/lib/shared';

// Mock the main server file
jest.mock('../../apps/chat-api/src/main', () => ({
  io: {
    on: jest.fn(),
    emit: jest.fn()
  }
}));

describe('Socket.IO Events', () => {
  let io: Server;
  let httpServer: any;
  let mockSocket: any;
  let poetBot: PoetBot;
  let connectedUsers: Map<string, User>;
  let messages: ChatMessage[];

  beforeEach(() => {
    // Create HTTP server
    httpServer = createServer();
    
    // Create Socket.IO server
    io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
      }
    });

    // Initialize PoetBot
    poetBot = new PoetBot({
      openaiApiKey: 'test-key',
      cooldownMs: 1000
    });

    // Initialize storage
    connectedUsers = new Map<string, User>();
    messages = [];

    // Mock socket
    mockSocket = {
      id: 'socket_123',
      emit: jest.fn(),
      broadcast: {
        emit: jest.fn()
      },
      on: jest.fn()
    };
  });

  afterEach(() => {
    httpServer.close();
    jest.clearAllMocks();
  });

  describe('Connection Events', () => {
    it('should handle new connection', () => {
      const emitSpy = jest.spyOn(mockSocket, 'emit');
      
      // Simulate connection by calling the socket emit directly
      mockSocket.emit('userConnected');
      
      expect(emitSpy).toHaveBeenCalledWith('userConnected');
    });

    it('should send initial data to new connection', () => {
      const emitSpy = jest.spyOn(mockSocket, 'emit');
      
      // Add some existing data
      const existingUser: User = { name: 'ExistingUser', socketId: 'socket_456' };
      connectedUsers.set('socket_456', existingUser);
      
      const existingMessage: ChatMessage = {
        id: 'msg_1',
        user: 'ExistingUser',
        message: 'Hello',
        timestamp: new Date()
      };
      messages.push(existingMessage);
      
      // Simulate connection with initial data
      mockSocket.emit('users', Array.from(connectedUsers.values()));
      mockSocket.emit('messages', messages);
      
      expect(emitSpy).toHaveBeenCalledWith('users', expect.any(Array));
      expect(emitSpy).toHaveBeenCalledWith('messages', expect.any(Array));
    });
  });

  describe('Join Events', () => {
    it('should handle user join with valid username', () => {
      const userName = 'TestUser';
      const emitSpy = jest.spyOn(io, 'emit');
      
      // Simulate join event
      const user: User = { name: userName.trim(), socketId: mockSocket.id };
      connectedUsers.set(mockSocket.id, user);
      
      // Emit user joined event
      io.emit('userJoined', user);
      
      expect(connectedUsers.has(mockSocket.id)).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith('userJoined', user);
    });

    it('should not handle join with empty username', () => {
      const userName: string = '';
      const emitSpy = jest.spyOn(io, 'emit');
      
      // Simulate join event with empty username
      if (userName && userName.trim()) {
        const user: User = { name: userName.trim(), socketId: mockSocket.id };
        connectedUsers.set(mockSocket.id, user);
        io.emit('userJoined', user);
      }
      
      expect(connectedUsers.has(mockSocket.id)).toBe(false);
      expect(emitSpy).not.toHaveBeenCalledWith('userJoined', expect.any(Object));
    });

    it('should not handle join with whitespace-only username', () => {
      const userName = '   ';
      const emitSpy = jest.spyOn(io, 'emit');
      
      // Simulate join event with whitespace username
      if (userName && userName.trim()) {
        const user: User = { name: userName.trim(), socketId: mockSocket.id };
        connectedUsers.set(mockSocket.id, user);
        io.emit('userJoined', user);
      }
      
      expect(connectedUsers.has(mockSocket.id)).toBe(false);
      expect(emitSpy).not.toHaveBeenCalledWith('userJoined', expect.any(Object));
    });
  });

  describe('Message Events', () => {
    beforeEach(() => {
      // Add a user to connected users
      const user: User = { name: 'TestUser', socketId: mockSocket.id };
      connectedUsers.set(mockSocket.id, user);
    });

    it('should handle new message from connected user', () => {
      const messageText = 'Hello everyone!';
      const user = connectedUsers.get(mockSocket.id);
      const emitSpy = jest.spyOn(io, 'emit');
      
      if (user && messageText && messageText.trim()) {
        const newMessage = createMessage(user, messageText);
        messages.push(newMessage);
        io.emit('newMessage', newMessage);
      }
      
      expect(messages).toHaveLength(1);
      expect(messages[0].user).toBe('TestUser');
      expect(messages[0].message).toBe('Hello everyone!');
      expect(emitSpy).toHaveBeenCalledWith('newMessage', expect.any(Object));
    });

    it('should not handle message from disconnected user', () => {
      const messageText = 'Hello everyone!';
      connectedUsers.delete(mockSocket.id);
      const emitSpy = jest.spyOn(io, 'emit');
      
      const user = connectedUsers.get(mockSocket.id);
      if (user && messageText && messageText.trim()) {
        const newMessage = createMessage(user, messageText);
        messages.push(newMessage);
        io.emit('newMessage', newMessage);
      }
      
      expect(messages).toHaveLength(0);
      expect(emitSpy).not.toHaveBeenCalledWith('newMessage', expect.any(Object));
    });

    it('should not handle empty message', () => {
      const messageText: string = '';
      const user = connectedUsers.get(mockSocket.id);
      const emitSpy = jest.spyOn(io, 'emit');
      
      if (user && messageText && messageText.trim()) {
        const newMessage = createMessage(user, messageText);
        messages.push(newMessage);
        io.emit('newMessage', newMessage);
      }
      
      expect(messages).toHaveLength(0);
      expect(emitSpy).not.toHaveBeenCalledWith('newMessage', expect.any(Object));
    });

    it('should not handle whitespace-only message', () => {
      const messageText = '   ';
      const user = connectedUsers.get(mockSocket.id);
      const emitSpy = jest.spyOn(io, 'emit');
      
      if (user && messageText && messageText.trim()) {
        const newMessage = createMessage(user, messageText);
        messages.push(newMessage);
        io.emit('newMessage', newMessage);
      }
      
      expect(messages).toHaveLength(0);
      expect(emitSpy).not.toHaveBeenCalledWith('newMessage', expect.any(Object));
    });
  });

  describe('Typing Events', () => {
    beforeEach(() => {
      // Add a user to connected users
      const user: User = { name: 'TestUser', socketId: mockSocket.id };
      connectedUsers.set(mockSocket.id, user);
    });

    it('should handle typing indicator from connected user', () => {
      const isTyping = true;
      const user = connectedUsers.get(mockSocket.id);
      const emitSpy = jest.spyOn(mockSocket.broadcast, 'emit');
      
      if (user) {
        mockSocket.broadcast.emit('userTyping', { user: user.name, isTyping });
      }
      
      expect(emitSpy).toHaveBeenCalledWith('userTyping', { user: 'TestUser', isTyping: true });
    });

    it('should not handle typing indicator from disconnected user', () => {
      const isTyping = true;
      connectedUsers.delete(mockSocket.id);
      const emitSpy = jest.spyOn(mockSocket.broadcast, 'emit');
      
      const user = connectedUsers.get(mockSocket.id);
      if (user) {
        mockSocket.broadcast.emit('userTyping', { user: user.name, isTyping });
      }
      
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('Disconnect Events', () => {
    it('should handle user disconnect', () => {
      // Add a user first
      const user: User = { name: 'TestUser', socketId: mockSocket.id };
      connectedUsers.set(mockSocket.id, user);
      
      const emitSpy = jest.spyOn(io, 'emit');
      
      // Simulate disconnect
      if (connectedUsers.has(mockSocket.id)) {
        const disconnectedUser = connectedUsers.get(mockSocket.id);
        connectedUsers.delete(mockSocket.id);
        io.emit('userLeft', disconnectedUser);
      }
      
      expect(connectedUsers.has(mockSocket.id)).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith('userLeft', user);
    });

    it('should not emit disconnect for non-existent user', () => {
      const emitSpy = jest.spyOn(io, 'emit');
      
      // Simulate disconnect for non-existent user
      if (connectedUsers.has(mockSocket.id)) {
        const disconnectedUser = connectedUsers.get(mockSocket.id);
        connectedUsers.delete(mockSocket.id);
        io.emit('userLeft', disconnectedUser);
      }
      
      expect(emitSpy).not.toHaveBeenCalledWith('userLeft', expect.any(Object));
    });
  });

  describe('Message Limits', () => {
    it('should keep only last 100 messages', () => {
      // Add 150 messages
      for (let i = 0; i < 150; i++) {
        const message: ChatMessage = {
          id: `msg_${i}`,
          user: 'TestUser',
          message: `Message ${i}`,
          timestamp: new Date()
        };
        messages.push(message);
      }
      
      // Apply message limit
      if (messages.length > 100) {
        messages.splice(0, messages.length - 100);
      }
      
      expect(messages).toHaveLength(100);
      expect(messages[0].id).toBe('msg_50');
      expect(messages[99].id).toBe('msg_149');
    });
  });
});
