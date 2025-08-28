# Chat Room Application

A real-time chat room application built with Angular 19, Node.js, Express, WebSocket (Socket.IO), and Firebase.

## Features

- 🚀 Real-time messaging with WebSocket
- 👥 Live user list with online/offline status
- ⌨️ Typing indicators
- 📱 Responsive design
- 🔥 Firebase integration for message persistence
- 🎨 Modern UI with beautiful gradients
- ⚡ Fast and lightweight

## Project Structure

```
chat-room/
├── apps/
│   ├── chat-ui/          # Angular 19 frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── components/
│   │   │   │   │   └── chat.component.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── chat.service.ts
│   │   │   │   │   └── firebase.service.ts
│   │   │   │   └── firebase.config.ts
│   │   │   └── ...
│   │   └── ...
│   └── chat-api/         # Node.js Express backend
│       ├── src/
│       │   └── main.ts
│       └── ...
└── ...
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project (for message persistence)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Update the Firebase configuration in `apps/chat-ui/src/app/firebase.config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
HOST=localhost
PORT=3001
```

## Running the Application

### Development Mode

1. **Start the API server:**
   ```bash
   npx nx serve chat-api
   ```
   The server will run on `http://localhost:3001`

2. **Start the Angular application:**
   ```bash
   npx nx serve chat-ui
   ```
   The application will run on `http://localhost:4200`

### Production Build

1. **Build the API:**
   ```bash
   npx nx build chat-api
   ```

2. **Build the UI:**
   ```bash
   npx nx build chat-ui
   ```

## Usage

1. Open your browser and navigate to `http://localhost:4200`
2. Enter your name in the login screen
3. Start chatting with other users in real-time!

## Features in Detail

### Real-time Messaging
- Instant message delivery using WebSocket
- Message history persistence in Firebase
- Automatic message cleanup (keeps last 1000 messages)

### User Management
- Live user list showing online users
- User join/leave notifications
- Typing indicators
- No authentication required - just enter your name

### UI/UX
- Modern gradient design
- Responsive layout for mobile and desktop
- Message bubbles with timestamps
- Smooth animations and transitions
- Auto-scroll to latest messages

## API Endpoints

- `GET /health` - Health check
- `GET /api/users` - Get connected users
- `GET /api/messages` - Get message history

## WebSocket Events

### Client to Server
- `join` - Join chat with username
- `message` - Send a message
- `typing` - Send typing indicator

### Server to Client
- `users` - Updated users list
- `newMessage` - New message received
- `messages` - All messages (when joining)
- `userJoined` - User joined notification
- `userLeft` - User left notification
- `userTyping` - Typing indicator

## Technologies Used

- **Frontend:** Angular 19, TypeScript, SCSS
- **Backend:** Node.js, Express, Socket.IO
- **Database:** Firebase Firestore
- **Build Tool:** Nx
- **Real-time:** WebSocket (Socket.IO)

## Development

### Adding New Features

1. **Backend:** Add new Socket.IO events in `apps/chat-api/src/main.ts`
2. **Frontend:** Update the chat service and component accordingly

### Styling

The application uses SCSS with a modern design system. Main styles are in the chat component.

### Testing

```bash
# Run tests for the API
npx nx test chat-api

# Run tests for the UI
npx nx test chat-ui
```

## Deployment

### Backend Deployment
The Express server can be deployed to:
- Heroku
- Vercel
- Railway
- DigitalOcean App Platform

### Frontend Deployment
The Angular app can be deployed to:
- Firebase Hosting
- Vercel
- Netlify
- GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this project for your own applications!

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
