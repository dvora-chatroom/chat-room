import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PoetBot } from '@chat-room/bot';
import { 
  User, 
  ChatMessage, 
  TypingUser, 
  ChatEvents,
  POETBOT_NAME,
  POETBOT_ID,
  createMessage,
  createBotMessage,
  hasMoreThanTwoWords,
  keepLastMessages
} from '@chat-room/shared';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const host = '0.0.0.0';

// Initialize PoetBot
const poetBot = new PoetBot({
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  botName: POETBOT_NAME,
  botId: POETBOT_ID,
  cooldownMs: 10000
});

// In-memory storage
const connectedUsers = new Map<string, User>();
const messages: Array<ChatMessage> = [];

/**
 * Emits the current users list including PoetBot to all connected clients.
 */
function emitUsersWithPoetBot() {
  const list = Array.from(connectedUsers.values());
  // Add PoetBot as dormant user to the list
  list.push({ name: poetBot.botName, socketId: poetBot.botId });
  io.emit(ChatEvents.Users, list);
}

// REST API endpoints
app.get('/api/users', (req, res) => {
  const list = Array.from(connectedUsers.values());
  list.push({ name: poetBot.botName, socketId: poetBot.botId });
  res.json(list);
});

app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send current users and messages to new connection
  socket.emit('users', [...Array.from(connectedUsers.values()), { name: poetBot.botName, socketId: poetBot.botId }]);
  socket.emit('messages', messages);

  // Handle user joining
  socket.on('join', (userName: string) => {
    if (userName && userName.trim()) {
      const user: User = { name: userName.trim(), socketId: socket.id };
      connectedUsers.set(socket.id, user);
      
      // Notify all clients about new user
      io.emit('userJoined', user);
      emitUsersWithPoetBot();
      
      console.log(`${userName} joined the chat`);
    }
  });

  // Handle new message
  socket.on('message', async (message: string) => {
    const user = connectedUsers.get(socket.id);
    if (user && message && message.trim()) {
      const newMessage = createMessage(user, message);
      
      messages.push(newMessage);
      keepLastMessages(messages);
      io.emit('newMessage', newMessage);
      console.log(`${user.name}: ${message}`);

      // PoetBot flow: check if message should trigger bot response
      if (hasMoreThanTwoWords(message)) {
        if (!poetBot.isOnCooldown()) {
          console.log('PoetBot: trigger detected for message:', message);
          poetBot.setCooldown(); // Set cooldown immediately when trigger is detected
          
          // Step 1: Classify if it's a tech question (no typing indicator yet)
          const isTech = await poetBot.classifyIsTechQuestion(message);
          console.log('PoetBot: classifier result:', isTech);
          
          if (isTech === true) {
            // Step 2: Only show typing indicator after classification returns true
            io.emit('userTyping', { user: poetBot.botName, isTyping: true });
            
            // Step 3: Generate poetic answer
            const answer = await poetBot.generatePoeticAnswer(message);
            
            // Step 4: Stop typing indicator
            io.emit('userTyping', { user: poetBot.botName, isTyping: false });
            
            if (answer) {
              const botMessage = createBotMessage(poetBot.botName, answer);
              messages.push(botMessage);
              keepLastMessages(messages);
              io.emit('newMessage', botMessage);
            }
          } else {
            console.log('PoetBot: classifier indicated non-tech or uncertain');
          }
        }
      }
    }
  });

  // Handle user typing
  socket.on('typing', (isTyping: boolean) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      socket.broadcast.emit('userTyping', { user: user.name, isTyping });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.delete(socket.id);
      io.emit('userLeft', user);
      emitUsersWithPoetBot();
      console.log(`${user.name} left the chat`);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    connectedUsers: connectedUsers.size,
    totalMessages: messages.length
  });
});

// Serve static files from the built UI in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const uiPath = path.join(__dirname, '../../../../chat-ui');
  
  // Serve static files
  app.use(express.static(uiPath));
  
  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path === '/health') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(uiPath, 'index.html'));
  });
}

httpServer.listen(port, host, () => {
  console.log(`🚀 Chat API server running at http://${host}:${port}`);
  console.log(`📡 WebSocket server ready for connections`);
});
